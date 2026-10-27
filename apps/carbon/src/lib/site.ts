export const SITE_URL = "https://carbon.alexandrejoly.me";
export const SITE_NAME = "Carbon";
export const SITE_TITLE = "Carbon: meeting transcripts that stay on your Mac";
export const SITE_DESCRIPTION =
  "A free macOS menu bar app that transcribes your meetings on your Mac. No bot joins the call, and nothing goes to the cloud. Coming soon.";
export const AUTHOR_URL = "https://alexandrejoly.me";
export const X_URL = "https://x.com/AlexDmzz";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
