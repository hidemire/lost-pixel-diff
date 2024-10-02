use actix_web::{
    web::{self, Bytes},
    HttpResponse, Responder,
};
use futures::TryStreamExt;
use lost_pixel::client::{GeneratorOutput, LostPixelClient};

use crate::utils::e500;

pub async fn generate(
    lost_pixel_client: web::Data<LostPixelClient>,
) -> Result<impl Responder, actix_web::Error> {
    let output_stream = lost_pixel_client.generate().await.map_err(e500)?;

    let output_stream = output_stream.map_ok(|line| {
        if let GeneratorOutput::Line(line) = line {
            Bytes::from(format!("{}\n", line))
        } else {
            Bytes::from("\n")
        }
    });
    Ok(HttpResponse::Ok()
        .content_type("application/octet-stream")
        .streaming(output_stream))
}
