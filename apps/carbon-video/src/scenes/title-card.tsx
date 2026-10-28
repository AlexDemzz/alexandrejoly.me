import { useCurrentFrame } from "remotion";

import { mix, settle } from "../motion";
import { CarbonMark } from "../ui/mark";
import { Stage } from "../ui/screen";
import { usePalette } from "../ui/theme";

/** A line of text on the page color, as on alexandrejoly.me; the mark on the first and last. */
export const TitleCard = ({
  text,
  withMark = false,
}: {
  text: string;
  withMark?: boolean;
}) => {
  const frame = useCurrentFrame();
  const COLOR = usePalette();
  const enter = settle(frame, 0, 18);

  return (
    <Stage background={COLOR.page}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          height: "100%",
          justifyContent: "center",
          opacity: enter,
          transform: `translateY(${mix(6, 0, enter)}px)`,
        }}
      >
        {withMark ? (
          <CarbonMark color={COLOR.pageForeground} size={44} />
        ) : null}
        <p
          style={{
            color: COLOR.pageForeground,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: -0.4,
            lineHeight: 1.25,
            margin: 0,
            maxWidth: 560,
            textAlign: "center",
            textWrap: "balance",
          }}
        >
          {text}
        </p>
      </div>
    </Stage>
  );
};
