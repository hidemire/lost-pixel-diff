use thiserror::Error;

use crate::docker::error::DockerClientError;

#[derive(Error, Debug)]
pub enum LostPixelError {
    #[error("Docker error")]
    DockerError(#[from] DockerClientError),

    #[error("IO error")]
    IoError(#[from] std::io::Error),

    #[error("Output stream error: {0}")]
    StreamError(String),

    #[error("Story not found")]
    StoryNotFound,
}
