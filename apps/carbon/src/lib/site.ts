export const SITE_URL = "https://carbon.alexandrejoly.me";
export const SITE_NAME = "Carbon";
export const SITE_TITLE = "Carbon: meeting transcripts that stay on your Mac";
export const SITE_DESCRIPTION =
  "A free, native macOS menu bar app that turns your meetings into Markdown files on your Mac, ready for any AI agent. No sign-in, no bot, no cloud.";
// Served by the release Worker (DMGs in R2) once the release pipeline ships.
export const DOWNLOAD_URL = "/download";
export const AUTHOR_URL = "https://alexandrejoly.me";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
