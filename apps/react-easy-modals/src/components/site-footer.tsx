import { TextLink } from "@/components/ui/text";
import { AUTHOR_URL, GITHUB_URL, NPM_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const SiteFooter = ({ className }: { className?: string }) => (
  <footer
    className={cn(
      "text-faint-foreground flex flex-wrap gap-x-4 gap-y-1 pt-10 text-sm",
      className
    )}
  >
    <p className="text-pretty">
      MIT licensed. Built by{" "}
      <TextLink variant="faint" href={AUTHOR_URL} external>
        Alexandre Joly
      </TextLink>
      .
    </p>
    <nav aria-label="Project">
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        <li>
          <TextLink variant="faint" href={GITHUB_URL} external>
            GitHub
          </TextLink>
        </li>
        <li>
          <TextLink variant="faint" href={NPM_URL} external>
            npm
          </TextLink>
        </li>
        <li>
          <TextLink variant="faint" href="/llms.txt">
            llms.txt
          </TextLink>
        </li>
      </ul>
    </nav>
  </footer>
);
