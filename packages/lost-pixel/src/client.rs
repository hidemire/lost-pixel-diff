use std::{path::PathBuf, sync::Arc};

use futures::{Stream, StreamExt};
use tokio::sync::{broadcast, Mutex};

use crate::{
    docker::client::{DockerClient, RunContainerOptions},
    error::LostPixelError,
    story::StoryKind,
};

#[derive(Clone)]
pub enum GeneratorOutput {
    Line(String),
    End,
}

struct GeneratorOutputStream {
    history: Vec<GeneratorOutput>,
    rx: broadcast::Receiver<GeneratorOutput>,
}

impl GeneratorOutputStream {
    fn merge_output(self) -> impl Stream<Item = Result<GeneratorOutput, LostPixelError>> {
        let history_stream = futures::stream::iter(self.history.into_iter().map(Ok));
        let live_stream =
            tokio_stream::wrappers::BroadcastStream::new(self.rx).map(|line| match line {
                Ok(line) => Ok(line),
                Err(e) => {
                    tracing::error!("Failed to receive output: {}", e);
                    Err(LostPixelError::StreamError(e.to_string()))
                }
            });
        history_stream.chain(live_stream)
    }
}

#[derive(Clone)]
pub struct LostPixelClient {
    /// The path to the lostpixel.config.(ts|js|cjs|mjs) file.
    workspace: PathBuf,
    /// The tag of the lostpixel/lost-pixel image to use.
    image_tag: String,
    /// The Docker client to use.
    docker_client: Arc<Mutex<Box<dyn DockerClient>>>,

    // Generate can be called multiple times, but only one execution can be active at a time.
    // output_history is persisted between calls to generate.
    // output_tx track the current output channel.
    output_history: Arc<Mutex<Vec<GeneratorOutput>>>,
    output_tx: Arc<Mutex<Option<broadcast::Sender<GeneratorOutput>>>>,
}

impl LostPixelClient {
    pub fn init(
        workspace: PathBuf,
        image_tag: impl ToString,
        docker_client: Box<dyn DockerClient>,
    ) -> Result<Self, LostPixelError> {
        Ok(LostPixelClient {
            workspace,
            docker_client: Arc::new(Mutex::new(docker_client)),
            image_tag: image_tag.to_string(),
            output_history: Arc::new(Mutex::new(vec![])),
            output_tx: Arc::new(Mutex::new(None)),
        })
    }

    pub fn workspace(&self) -> &PathBuf {
        &self.workspace
    }

    /// Takes screenshots of stories.
    ///
    /// Returns a stream of `GeneratorOutput` that represents the output of the command.
    /// If command is running, it will return the existing stream with the current output.
    ///
    /// # Panics
    pub async fn generate(
        &self,
    ) -> Result<impl Stream<Item = Result<GeneratorOutput, LostPixelError>>, LostPixelError> {
        let mut tx_guard = self.output_tx.lock().await;

        if tx_guard.is_none() {
            let run_container_options = RunContainerOptions {
                image: format!("lostpixel/lost-pixel:{}", self.image_tag),
                rm: true,
                cmd: None,
                env: Some(vec![
                    "DOCKER=1".to_string(),
                    format!("WORKSPACE={}", self.workspace.display()),
                ]),
                volume: Some(vec![format!("{0}:{0}", self.workspace.display())]),
            };

            let (tx, _) = broadcast::channel(100);
            *tx_guard = Some(tx.clone());

            let output_history = self.output_history.clone();
            let docker_client = self.docker_client.clone();

            tracing::info!("Running lost-pixel container");

            let generate_task = tokio::spawn(async move {
                let _docker_client = docker_client.lock().await;

                let mut receiver = _docker_client
                    .run_container(run_container_options)
                    .await
                    .expect("Failed to run container");

                while let Some(line) = receiver.recv().await {
                    {
                        let mut output_history = output_history.lock().await;
                        output_history.push(GeneratorOutput::Line(line.clone()));
                    }

                    if tx.receiver_count() != 0 {
                        if let Err(e) = tx.send(GeneratorOutput::Line(line)) {
                            tracing::error!("Failed to send line: {}", e);
                            break;
                        }
                    } else {
                        tracing::warn!("No receiver, dropping line: {}", line);
                    }
                }
            });

            let output_history = self.output_history.clone();
            let tx_guard = self.output_tx.clone();

            tokio::spawn(async move {
                let result = generate_task.await;
                if let Err(e) = result {
                    tracing::error!("Failed to generate stories: {}", e);
                } else {
                    tracing::info!("Stories generation completed");
                }

                output_history.lock().await.clear();
                // send end signal to the output stream
                // drop the tx to notify the stream that it should end
                let output_tx = tx_guard.lock().await.take();
                if let Some(tx) = output_tx {
                    tx.send(GeneratorOutput::End).ok();
                }
            });
        }

        let history = self.output_history.lock().await.clone();
        let live_rx = tx_guard
            .clone()
            .as_ref()
            .expect("Failed to get output tx")
            .subscribe();

        Ok(GeneratorOutputStream {
            history,
            rx: live_rx,
        }
        .merge_output())
    }

    /// Promotes current story screenshot to the baseline.
    pub fn promote_story(&self, story_id: &str) -> Result<(), LostPixelError> {
        let src = self.build_story_path(&StoryKind::Current, story_id);
        let dst = self.build_story_path(&StoryKind::Baseline, story_id);
        let diff = self.build_story_path(&StoryKind::Diff, story_id);

        if diff.is_file() {
            std::fs::remove_file(&diff)?;
        }

        std::fs::copy(src, dst)?;
        Ok(())
    }

    /// List stories of a specific kind.
    pub fn list_stories(&self, story_kind: &StoryKind) -> Result<Vec<String>, LostPixelError> {
        let story_folder = self.build_story_folder(story_kind);

        let mut stories = vec![];
        for entry in std::fs::read_dir(story_folder)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                stories.push(
                    path.file_name()
                        .ok_or(LostPixelError::IoError(std::io::Error::new(
                            std::io::ErrorKind::InvalidData,
                            "Failed to get file name",
                        )))?
                        .to_string_lossy()
                        .to_string(),
                );
            }
        }
        Ok(stories)
    }

    /// Get a story of a specific kind.
    pub fn get_story(
        &self,
        story_kind: &StoryKind,
        story_id: &str,
    ) -> Result<Vec<u8>, LostPixelError> {
        let story_path = self.build_story_path(story_kind, story_id);

        if story_path.is_file() {
            Ok(std::fs::read(story_path)?)
        } else {
            Err(LostPixelError::StoryNotFound)
        }
    }

    fn build_story_folder(&self, kind: &StoryKind) -> PathBuf {
        let folder_name = match kind {
            StoryKind::Diff => "difference",
            StoryKind::Current => "current",
            StoryKind::Baseline => "baseline",
        };
        self.workspace.join(".lostpixel").join(folder_name)
    }

    fn build_story_path(&self, kind: &StoryKind, story_id: &str) -> PathBuf {
        self.build_story_folder(kind).join(story_id)
    }
}
