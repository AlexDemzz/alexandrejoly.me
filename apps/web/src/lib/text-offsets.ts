/**
 * Pairs each part of a static text with where it starts in that text: a
 * stable React key, even when the same part repeats.
 */
export const withOffsets = <Part>(
  parts: readonly Part[],
  length: (part: Part) => number,
  separatorLength = 0
): { offset: number; part: Part }[] => {
  let offset = 0;
  return parts.map((part) => {
    const start = offset;
    offset += length(part) + separatorLength;
    return { offset: start, part };
  });
};
