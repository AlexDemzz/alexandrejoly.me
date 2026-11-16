import { TextLink } from "@/components/text-link";
import { AUTHOR_URL, SOURCE_URL, UI_SDK_URL } from "@/lib/site";

const LINK = "inline-block py-1 text-tile-ink";

export const SiteFooter = () => (
  <footer className="px-gutter text-tile-dim w-full pt-8 pb-10 text-sm">
    <div className="max-w-site before:bg-tile-line mx-auto flex flex-wrap justify-between gap-x-12 gap-y-4 before:mb-2 before:h-px before:basis-full">
      <p className="max-w-136 wrap-break-word">
        An independent project inspired by the control panel of Polestar’s
        Formula 2030 concept. Not affiliated with Polestar.
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        <li>
          Made by{" "}
          <TextLink className={LINK} href={AUTHOR_URL}>
            Alexandre Joly
          </TextLink>
        </li>
        <li>
          <TextLink className={LINK} href={UI_SDK_URL}>
            UI SDK
          </TextLink>
        </li>
        <li>
          <TextLink className={LINK} href={SOURCE_URL}>
            Source on GitHub
          </TextLink>
        </li>
      </ul>
    </div>
  </footer>
);
