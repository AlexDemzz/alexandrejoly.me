// DESIGN.md › Components › Heading anchor: the title links to its own section
// and underlines on hover, like a sidebar link; a `#` in the margin shows while
// it is hovered or focused, and stays on touch.
export const HeadingAnchor = ({
  children,
  id,
}: {
  children: string;
  id: string;
}) => (
  <a
    className="group/anchor decoration-underline can-hover:hover:underline relative underline-offset-3 focus-visible:underline"
    href={`#${id}`}
  >
    {children}
    <span
      aria-hidden
      className="text-subtle-foreground can-hover:opacity-0 can-hover:group-hover/anchor:opacity-100 can-hover:group-focus-visible/anchor:opacity-100 absolute -start-6 w-6 text-center transition-opacity duration-200 ease-out"
    >
      #
    </span>
  </a>
);
