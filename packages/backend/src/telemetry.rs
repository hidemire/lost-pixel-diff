use tokio::task::JoinHandle;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{fmt::MakeWriter, layer::SubscriberExt, EnvFilter};

pub fn get_subscriber<W>(level: LevelFilter, writer: W) -> impl tracing::Subscriber + Sync + Send
where
    W: for<'a> MakeWriter<'a> + Send + Sync + 'static,
{
    let env_filter = EnvFilter::builder()
        .with_default_directive(level.into())
        .from_env_lossy();

    let formatting_layer = tracing_subscriber::fmt::layer().with_writer(writer);

    tracing_subscriber::registry()
        .with(env_filter)
        .with(formatting_layer)
}

/// # Panics
pub fn init_subscriber(subscriber: impl tracing::Subscriber + Sync + Send) {
    tracing::subscriber::set_global_default(subscriber).expect("Failed to set subscriber");
}

pub fn spawn_blocking_with_tracing<F, R>(f: F) -> JoinHandle<R>
where
    F: FnOnce() -> R + Send + 'static,
    R: Send + 'static,
{
    let current_span = tracing::Span::current();
    actix_web::rt::task::spawn_blocking(move || current_span.in_scope(f))
}
