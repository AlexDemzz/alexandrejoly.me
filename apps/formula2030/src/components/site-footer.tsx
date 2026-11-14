import { AUTHOR_URL, SOURCE_URL, UI_SDK_URL } from "@/lib/site";

export const SiteFooter = () => (
  <footer className="site-footer">
    <p className="site-footer-note">
      An independent project inspired by the control panel of Polestar’s Formula
      2030 concept. Not affiliated with Polestar or Vercel.
    </p>
    <ul className="site-footer-links">
      <li>
        Made by{" "}
        <a className="link" href={AUTHOR_URL}>
          Alexandre Joly
        </a>
      </li>
      <li>
        <a className="link" href={UI_SDK_URL}>
          UI SDK
        </a>
      </li>
      <li>
        <a className="link" href={SOURCE_URL}>
          Source on GitHub
        </a>
      </li>
    </ul>
  </footer>
);
