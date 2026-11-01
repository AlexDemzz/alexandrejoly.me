import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@portfolio/ui/components/item";
import { usePathname } from "fumadocs-core/framework";
import { Link } from "fumadocs-core/link";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";

const withoutTrailingSlash = (url: string) => url.replace(/\/$/u, "");

// Only the way forward; the sidebar already holds the way back.
const DocsNextPage = () => {
  const items = useFooterItems();
  const pathname = withoutTrailingSlash(usePathname());
  const index = items.findIndex(
    (item) => withoutTrailingSlash(item.url) === pathname
  );
  const next = index === -1 ? undefined : items[index + 1];

  if (!next) {
    return null;
  }

  return (
    // With #nd-page's 16px gap: 48px under the page. -my-2.75 cancels the
    // row's hit-area padding and border, so the gaps are the visible ones.
    <nav aria-label="Next page" className="mt-8">
      <Item
        variant="underline"
        className="-my-2.75"
        render={<Link href={next.url} />}
      >
        <ItemContent>
          <ItemTitle>
            <span>Next: {next.name}</span>
          </ItemTitle>
          {next.description ? (
            <ItemDescription>{next.description}</ItemDescription>
          ) : null}
        </ItemContent>
      </Item>
    </nav>
  );
};

export { DocsNextPage };
