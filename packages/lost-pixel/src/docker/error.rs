use thiserror::Error;

#[derive(Error, Debug)]
pub enum DockerClientError {
    #[error("Failed to run container: {0}")]
    RunContainerError(String),
    #[error("Failed to list containers: {0}")]
    ListContainersError(String),
}
