use actix_web::{web, HttpResponse, Responder};
use lost_pixel::{client::LostPixelClient, story::StoryKind};

use crate::utils::e500;

pub async fn list_stories(
    story_kind: web::Path<StoryKind>,
    lost_pixel_client: web::Data<LostPixelClient>,
) -> Result<impl Responder, actix_web::Error> {
    let stories = lost_pixel_client.list_stories(&story_kind).map_err(e500)?;
    Ok(HttpResponse::Ok().json(stories))
}
