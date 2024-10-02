use std::{
    net::{IpAddr, TcpListener},
    sync::Arc,
};

use actix_cors::Cors;
use actix_web::{
    dev::Server,
    web::{self, ServiceConfig},
    App, HttpResponse, HttpServer, Responder,
};
use lost_pixel::{client::LostPixelClient, docker::DockerClient};

use crate::{
    routes::{generate, get_story, promote},
    settings::Settings,
};

pub struct Application {
    ip: IpAddr,
    port: u16,
    server: Server,
}

impl Application {
    pub fn build(settings: Settings) -> Result<Self, std::io::Error> {
        let address = format!("{}:{}", settings.host, settings.port);
        let listener = TcpListener::bind(address)?;
        let socket_addr = listener.local_addr()?;
        let ip = socket_addr.ip();
        let port = socket_addr.port();

        let configurator = configure_app(&settings);

        let server = HttpServer::new(move || {
            App::new()
                .wrap(
                    Cors::default()
                        .allow_any_header()
                        .allow_any_method()
                        .allow_any_origin(),
                )
                .configure(configurator.clone())
        })
        .listen(listener)?
        .run();

        Ok(Self { ip, port, server })
    }

    pub fn ip(&self) -> IpAddr {
        self.ip
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub async fn run(self) -> Result<(), std::io::Error> {
        self.server.await
    }
}

async fn pong() -> impl Responder {
    HttpResponse::Ok().body("pong")
}

/// # Panics
pub fn get_lost_pixel_client(settings: &Settings) -> Arc<LostPixelClient> {
    let docker_client = DockerClient {};
    let docker_client = Box::new(docker_client);
    let client = LostPixelClient::init(
        settings.workspace.clone(),
        &settings.lost_pixel_image_tag,
        docker_client,
    )
    .expect("Failed to initialize LostPixelClient");
    Arc::new(client)
}

pub fn configure_app(settings: &Settings) -> impl FnOnce(&mut ServiceConfig) + Clone {
    let lost_pixel_client = get_lost_pixel_client(settings);

    move |app: &mut ServiceConfig| {
        app.route("/ping", actix_web::web::get().to(pong))
            .service(
                web::scope("/api")
                    .route("/generate", web::post().to(generate))
                    .route("/promote", web::post().to(promote)),
            )
            .service(
                web::scope("/stories").route("/{story_id}/{story_type}", web::get().to(get_story)),
            )
            .app_data(web::Data::from(lost_pixel_client));
    }
}
