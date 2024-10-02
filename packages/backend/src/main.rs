use backend::{
    settings::Settings,
    startup::Application,
    telemetry::{get_subscriber, init_subscriber},
};
use tracing::level_filters::LevelFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let subscriber = get_subscriber(LevelFilter::INFO, std::io::stdout);
    init_subscriber(subscriber);

    let settings = Settings::new()?;

    let application = Application::build(settings)?;
    tracing::info!("Listening on {}:{}", application.ip(), application.port());

    application.run().await?;
    tracing::info!("Exiting...");

    Ok(())
}
