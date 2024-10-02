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

    let address = format!("{}:{}", &settings.host, &settings.port);
    let application = Application::build(settings.clone())?;
    tracing::info!("Listening on {}", address);

    if settings.open_browser {
        if let Err(e) = open::that(format!("http://{}", address)) {
            tracing::error!("Failed to open browser: {}", e);
        }
    }

    application.run().await?;
    tracing::info!("Exiting...");

    Ok(())
}
