use std::net::{IpAddr, TcpListener};

use actix_cors::Cors;
use actix_web::{dev::Server, web::ServiceConfig, App, HttpResponse, HttpServer, Responder};

use crate::settings::Settings;

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

        let configurator = configure_app();

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

pub fn configure_app() -> impl FnOnce(&mut ServiceConfig) + Clone {
    move |app: &mut ServiceConfig| {
        app.route("/ping", actix_web::web::get().to(pong));
    }
}
