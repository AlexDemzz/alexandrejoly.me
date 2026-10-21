interface MediaRange {
  quality: number;
  subtype: string;
  type: string;
}

const QUALITY_PARAMETER = /^q=(?<quality>[\d.]+)$/iu;

const parseAccept = (accept: string): MediaRange[] =>
  accept.split(",").flatMap((entry) => {
    const [range = "", ...parameters] = entry
      .split(";")
      .map((part) => part.trim());
    const [type, subtype] = range.toLowerCase().split("/");
    if (!(type && subtype)) {
      return [];
    }
    const qualityMatch = parameters
      .map((parameter) => QUALITY_PARAMETER.exec(parameter))
      .find((match) => match !== null);
    const quality = qualityMatch ? Number(qualityMatch.groups?.quality) : 1;
    return Number.isNaN(quality) ? [] : [{ quality, subtype, type }];
  });

const SPECIFICITY = { exact: 2, subtypeWildcard: 1, wildcard: 0 } as const;

interface Preference {
  exact: boolean;
  quality: number;
}

/** RFC 9110 §12.5.1: the most specific range that matches sets the quality. */
const preferenceFor = (ranges: MediaRange[], mediaType: string): Preference => {
  const [type, subtype] = mediaType.split("/");
  let best: { quality: number; specificity: number } | undefined;
  for (const range of ranges) {
    let specificity: number | undefined;
    if (range.type === type && range.subtype === subtype) {
      specificity = SPECIFICITY.exact;
    } else if (range.type === type && range.subtype === "*") {
      specificity = SPECIFICITY.subtypeWildcard;
    } else if (range.type === "*" && range.subtype === "*") {
      specificity = SPECIFICITY.wildcard;
    }
    if (specificity !== undefined && specificity > (best?.specificity ?? -1)) {
      best = { quality: range.quality, specificity };
    }
  }
  return {
    exact: best?.specificity === SPECIFICITY.exact,
    quality: best?.quality ?? 0,
  };
};

/**
 * Whether a request asks for Markdown over HTML. A tie goes to Markdown only
 * when the client names `text/markdown` itself: wildcards keep serving HTML.
 */
export const prefersMarkdown = (accept: string | null): boolean => {
  if (accept === null) {
    return false;
  }
  const ranges = parseAccept(accept);
  const markdown = preferenceFor(ranges, "text/markdown");
  const html = preferenceFor(ranges, "text/html");
  if (markdown.quality <= 0) {
    return false;
  }
  return (
    markdown.quality > html.quality ||
    (markdown.quality === html.quality && markdown.exact)
  );
};
