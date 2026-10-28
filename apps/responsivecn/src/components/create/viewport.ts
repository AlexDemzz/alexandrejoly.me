// Geometry for previews that show a viewport wider than the room on screen:
// the iframe keeps its real (logical) width, so use-mobile inside it sees the
// width it claims, and a scale transform draws it smaller to fit. (WebKit
// applies CSS zoom to an iframe's document as well as its box, shrinking it
// twice.)

export const fitScale = (
  logicalWidth: number,
  availableWidth: number
): number => {
  if (logicalWidth <= 0 || availableWidth <= 0) {
    return 1;
  }
  return Math.min(1, availableWidth / logicalWidth);
};
