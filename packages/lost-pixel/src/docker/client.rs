use async_trait::async_trait;
use tokio::sync::mpsc;

use super::error::DockerClientError;

pub struct RunContainerOptions {
    pub image: String,
    pub rm: bool,
    pub cmd: Option<Vec<String>>,
    pub env: Option<Vec<String>>,
    pub volume: Option<Vec<String>>,
}

#[async_trait]
pub trait DockerClient: Send + Sync {
    async fn run_container(
        &self,
        options: RunContainerOptions,
    ) -> Result<mpsc::Receiver<String>, DockerClientError>;
}
