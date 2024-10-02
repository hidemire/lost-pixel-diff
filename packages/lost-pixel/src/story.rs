use std::str::FromStr;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub enum StoryKind {
    /// A story that is different from the baseline.
    #[serde(rename = "diff")]
    Diff,
    /// A story that is currently generated.
    #[serde(rename = "current")]
    Current,
    /// A story that is marked as correct.
    #[serde(rename = "baseline")]
    Baseline,
}

impl FromStr for StoryKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "diff" => Ok(Self::Diff),
            "current" => Ok(Self::Current),
            "baseline" => Ok(Self::Baseline),
            _ => Err(format!("Unknown story kind: {}", s)),
        }
    }
}
