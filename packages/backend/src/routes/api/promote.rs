use actix_web::{web, HttpResponse, Responder};
use lost_pixel::client::LostPixelClient;
use serde::Deserialize;

use crate::utils::e500;

#[derive(Deserialize)]
pub struct PromoteDto {
    story_id: String,
}

pub async fn promote(
    promote_dto: web::Json<PromoteDto>,
    lost_pixel_client: web::Data<LostPixelClient>,
) -> Result<impl Responder, actix_web::Error> {
    lost_pixel_client
        .promote_story(&promote_dto.story_id)
        .map_err(e500)?;
    Ok(HttpResponse::Ok().body("OK"))
}
