// DESIGN.md › Docs pages › Components › Heading anchor: the title links to its
// own section and underlines on hover, like a sidebar link; a `#` in the margin
// (after the title below `sm`, where there is no margin) shows while it is
// hovered or focused, and stays on touch. A pseudo-element with empty alt text,
// so the `#` is in neither the heading's text nor its accessible name.
export const HeadingAnchor = ({
  children,
  id,
}: {
  children: string;
  id: string;
}) => (
  <a
    className="decoration-underline can-hover:hover:underline can-hover:after:opacity-0 can-hover:hover:after:opacity-100 can-hover:focus-visible:after:opacity-100 after:text-subtle-foreground relative underline-offset-3 after:absolute after:-start-6 after:w-6 after:text-center after:transition-opacity after:duration-200 after:ease-out after:content-['#'_/_''] focus-visible:underline max-sm:after:static max-sm:after:inline-block"
    href={`#${id}`}
  >
    {children}
  </a>
);
