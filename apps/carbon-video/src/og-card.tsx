import { AbsoluteFill } from "remotion";

import { CarbonMark } from "./ui/mark";
import { FONT, PALETTES } from "./ui/theme";

const COLOR = PALETTES.light;

export const OG = { height: 630, width: 1200 };

/** The share card of carbon.alexandrejoly.me: the mark over the landing's statement. */
export const OgCard = () => (
  <AbsoluteFill
    style={{
      background: COLOR.page,
      fontFamily: FONT,
      gap: 40,
      justifyContent: "center",
      padding: "0 96px",
      WebkitFontSmoothing: "antialiased",
    }}
  >
    <CarbonMark color={COLOR.pageForeground} size={96} />
    <p
      style={{
        color: COLOR.pageMuted,
        fontSize: 52,
        letterSpacing: -0.8,
        lineHeight: 1.3,
        margin: 0,
        textWrap: "balance",
      }}
    >
      <strong style={{ color: COLOR.pageForeground, fontWeight: 600 }}>
        Carbon
      </strong>{" "}
      transcribes your meetings on your Mac. No bot joins the call, and nothing
      goes to the cloud.
    </p>
  </AbsoluteFill>
);
