use std::path::PathBuf;

use clap::Parser;
use figment::{
    providers::{Env, Serialized},
    Figment,
};
use serde::{Deserialize, Serialize};

#[derive(Parser, Serialize, Deserialize, Clone, Debug)]
#[clap(disable_help_flag = true)]
pub struct Settings {
    #[clap(long, action = clap::ArgAction::HelpLong)]
    help: Option<bool>,

    #[clap(short, long, default_value = "localhost")]
    pub host: String,
    #[clap(short, long, default_value = "3000")]
    pub port: u16,
    #[clap(short, long, action = clap::ArgAction::Set, default_value = "true")]
    pub open_browser: bool,

    #[clap(short, long, default_value = default_workspace().into_os_string())]
    pub workspace: PathBuf,
    #[clap(short, long, default_value = "v3.18.2")]
    pub lost_pixel_image_tag: String,
}

/// # Panics
pub fn default_workspace() -> PathBuf {
    std::env::current_dir().expect("failed to get current directory")
}

impl Settings {
    pub fn new() -> Result<Self, figment::Error> {
        let cli = Self::parse();

        let settings = Figment::new()
            .merge(Serialized::defaults(cli))
            .merge(Env::prefixed("APP_"))
            .extract()?;

        Ok(settings)
    }
}
