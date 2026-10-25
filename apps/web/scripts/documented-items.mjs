// The registry items documented on this site. An item whose meta.docs links to
// another site is only served under /r/: no page, sitemap entry or OG card.
export const documentedItems = (registry) =>
  registry.items.filter(({ meta }) => !meta?.docs);
