use backend::{settings::Settings, startup::Application};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let settings = Settings::new()?;
    let application = Application::build(settings)?;
    application.run().await?;
    Ok(())
}
