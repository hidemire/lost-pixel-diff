use actix_web::{http::StatusCode, HttpResponse, Responder};
use mime_guess::from_path;
use rust_embed::Embed;

#[derive(Embed)]
#[folder = "../frontend/dist"]
struct Asset;

fn handle_embedded_file(path: &str) -> HttpResponse {
    match Asset::get(path) {
        Some(content) => HttpResponse::Ok()
            .content_type(from_path(path).first_or_octet_stream().as_ref())
            .body(content.data.into_owned()),
        None => HttpResponse::NotFound().body("404 Not Found"),
    }
}

#[allow(clippy::unused_async)]
pub async fn spa(path: actix_web::web::Path<String>) -> impl Responder {
    let res = handle_embedded_file(&path);

    match res.status() {
        StatusCode::NOT_FOUND => handle_embedded_file("index.html"),
        _ => res,
    }
}
