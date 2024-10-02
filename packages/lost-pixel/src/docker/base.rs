use std::process::Stdio;

use async_trait::async_trait;
use tokio::{io::AsyncBufReadExt, process::Command, sync::mpsc};

use super::{client::RunContainerOptions, error::DockerClientError};

pub struct DockerClient {}

#[async_trait]
impl super::client::DockerClient for DockerClient {
    async fn run_container(
        &self,
        options: RunContainerOptions,
    ) -> Result<mpsc::Receiver<String>, DockerClientError> {
        let mut command = Command::new("docker");
        command.arg("run");

        let (tx, rx) = mpsc::channel(100);

        if options.rm {
            command.arg("--rm");
        }

        if let Some(env) = options.env {
            for e in env {
                command.arg("-e").arg(e);
            }
        }

        if let Some(volume) = options.volume {
            for v in volume {
                command.arg("-v").arg(v);
            }
        }

        command.arg(&options.image);

        if let Some(cmd) = options.cmd {
            command.args(cmd);
        }

        let child = command
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                DockerClientError::RunContainerError(format!("Failed to run container: {}", e))
            })?;

        tokio::spawn(async move {
            let stdout = child.stdout.expect("Failed to get stdout");
            let mut reader = tokio::io::BufReader::new(stdout).lines();

            while let Some(line) = reader.next_line().await.expect("Failed to read line") {
                if let Err(e) = tx.send(line).await {
                    tracing::error!("Failed to send line: {}", e);
                    break;
                }
            }

            let stderr = child.stderr.expect("Failed to get stderr");
            let mut reader = tokio::io::BufReader::new(stderr).lines();

            while let Some(line) = reader.next_line().await.expect("Failed to read line") {
                if let Err(e) = tx.send(line).await {
                    tracing::error!("Failed to send line: {}", e);
                    break;
                }
            }
        });

        Ok(rx)
    }
}
