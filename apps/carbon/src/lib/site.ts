export const SITE_URL = "https://carbon.alexandrejoly.me";
export const SITE_NAME = "Carbon";
export const SITE_TITLE = "Carbon: meeting transcripts that stay on your Mac";
export const SITE_DESCRIPTION =
  "Carbon is a menu bar app that transcribes your meetings on your Mac, with no bot in the call and no cloud. Free when it ships.";
export const AUTHOR_URL = "https://alexandrejoly.me";
export const X_URL = "https://x.com/AlexDmzz";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
