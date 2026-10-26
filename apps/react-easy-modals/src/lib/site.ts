export const SITE_URL = "https://react-easy-modals.alexandrejoly.me";
export const SITE_NAME = "React Easy Modals";
export const SITE_DESCRIPTION =
  "A headless, zero-dependency modal stack for React. Open a modal with await modals.open() and get its answer back.";
export const GITHUB_URL = "https://github.com/AlexDemzz/react-easy-modals";
export const NPM_URL = "https://www.npmjs.com/package/react-easy-modals";
export const AUTHOR_URL = "https://alexandrejoly.me";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
