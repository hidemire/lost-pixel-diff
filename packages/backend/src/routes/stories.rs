use actix_web::{web, HttpResponse, Responder};
use lost_pixel::{client::LostPixelClient, error::LostPixelError, story::StoryKind};

use crate::utils::{e404, e500};

pub async fn get_story(
    params: web::Path<(String, StoryKind)>,
    lost_pixel_client: web::Data<LostPixelClient>,
) -> Result<impl Responder, actix_web::Error> {
    let (story_id, story_kind) = params.into_inner();
    let story = lost_pixel_client
        .get_story(&story_kind, &story_id)
        .map_err(|e| match e {
            LostPixelError::StoryNotFound => e404(e),
            _ => e500(e),
        })?;

    Ok(HttpResponse::Ok()
        .content_type(mime_guess::from_path(&story_id).first_or_octet_stream())
        .body(story))
}
