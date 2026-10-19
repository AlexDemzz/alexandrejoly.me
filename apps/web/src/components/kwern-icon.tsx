import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";

const BODY =
  "M0,107.334c0,-43.0182 33.9539,-78.106 76.5241,-79.9258l3.0239,-14.226c0.5627,-2.6469 3.1649,-4.3367 5.8119,-3.7741c2.6469,0.5627 4.3366,3.165 3.7741,5.8119l-0.9351,4.3969c1.8192,-1.9058 4.1667,-3.8164 6.8918,-5.5194c7.8687,-4.9165 15.9082,-6.2444 17.9571,-2.9661c2.0482,3.2786 -2.6705,9.922 -10.5385,14.8387c-2.0275,1.2669 -4.0666,2.2946 -6.0115,3.0669c36.2675,7.6035 63.5022,39.7698 63.5022,78.297c0,44.1828 -35.8172,80 -80,80c-44.1828,0 -80,-35.8172 -80,-80z";

// The "thinking" phase from Kwern's own app, opened and closed on the rest
// pose. It runs through the Web Animations API rather than CSS so that leaving
// the row can ease back from wherever the loop is, instead of snapping.
const PONDER_MS = 4000;
const RETURN_MS = 400;
const EASE_SETTLE = "cubic-bezier(0.23, 1, 0.32, 1)";

const BODY_FRAMES: Keyframe[] = [
  { offset: 0, transform: "none" },
  { offset: 0.16, transform: "rotate(-7deg)" },
  { offset: 0.38, transform: "rotate(-6deg) translateY(-1px)" },
  { offset: 0.56, transform: "rotate(6deg) translateY(-0.5px)" },
  { offset: 0.68, transform: "rotate(6deg) translateY(-0.5px)" },
  { offset: 0.88, transform: "rotate(-3deg)" },
  { offset: 1, transform: "none" },
];

const EYE_FRAMES: Keyframe[] = [
  { offset: 0, transform: "none" },
  { offset: 0.1, transform: "translate(-14px, -12px) scaleY(0.5)" },
  { offset: 0.3, transform: "translate(-14px, -12px) scaleY(0.5)" },
  { offset: 0.36, transform: "translate(6px, -14px) scaleY(0.9)" },
  { offset: 0.62, transform: "translate(6px, -14px) scaleY(0.9)" },
  { offset: 0.68, transform: "translate(-4px, -2px) scaleY(0.32)" },
  { offset: 0.86, transform: "translate(-4px, -2px) scaleY(0.32)" },
  { offset: 1, transform: "none" },
];

const usePonderOnRowHover = (ref: RefObject<SVGSVGElement | null>) => {
  useEffect(() => {
    const svg = ref.current;
    const row = svg?.closest<HTMLElement>(".group\\/item");
    const body = svg?.querySelector<SVGElement>("[data-part=body]");
    const eyes = svg?.querySelectorAll<SVGElement>("[data-part=eye]");
    if (!(row && body && eyes)) {
      return;
    }
    const parts: [SVGElement, Keyframe[], string][] = [
      [body, BODY_FRAMES, "ease-in-out"],
      ...[...eyes].map((eye): [SVGElement, Keyframe[], string] => [
        eye,
        EYE_FRAMES,
        EASE_SETTLE,
      ]),
    ];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover)");
    let running: Animation[] = [];

    const settle = () => {
      running = running.map((animation, index) => {
        const [element] = parts[index] ?? [];
        if (!element) {
          return animation;
        }
        const { transform } = getComputedStyle(element);
        animation.cancel();
        return element.animate([{ transform }, { transform: "none" }], {
          duration: RETURN_MS,
          easing: EASE_SETTLE,
        });
      });
    };

    const ponder = () => {
      if (reducedMotion.matches) {
        return;
      }
      for (const animation of running) {
        animation.cancel();
      }
      running = parts.map(([element, keyframes, easing]) =>
        element.animate(keyframes, {
          duration: PONDER_MS,
          easing,
          iterations: Number.POSITIVE_INFINITY,
        })
      );
    };

    const onEnter = () => canHover.matches && ponder();
    const onLeave = () => {
      if (!row.matches(":focus-visible")) {
        settle();
      }
    };
    const onFocus = () => row.matches(":focus-visible") && ponder();
    const onBlur = () => {
      if (!row.matches(":hover")) {
        settle();
      }
    };

    row.addEventListener("pointerenter", onEnter);
    row.addEventListener("pointerleave", onLeave);
    row.addEventListener("focus", onFocus);
    row.addEventListener("blur", onBlur);
    return () => {
      row.removeEventListener("pointerenter", onEnter);
      row.removeEventListener("pointerleave", onLeave);
      row.removeEventListener("focus", onFocus);
      row.removeEventListener("blur", onBlur);
      for (const animation of running) {
        animation.cancel();
      }
    };
  }, [ref]);
};

// Kwern's mark, the eyes cut out of the body by a mask. Inside a row, hovering
// or focusing the row makes it ponder: the body sways and the eyes look around.
export const KwernIcon = ({ className }: { className?: string }) => {
  const maskId = useId();
  const ref = useRef<SVGSVGElement>(null);
  usePonderOnRowHover(ref);
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      height={16}
      overflow="visible"
      ref={ref}
      viewBox="0 21.32 160 160"
      width={16}
    >
      <defs>
        {/* Oversized because the body swings past the viewBox. */}
        <mask
          height={220}
          id={maskId}
          maskUnits="userSpaceOnUse"
          width={200}
          x={-20}
          y={-20}
        >
          <rect
            className="fill-white"
            height={220}
            width={200}
            x={-20}
            y={-20}
          />
          <rect
            className="origin-center fill-black transform-fill"
            data-part="eye"
            height={34}
            rx={9}
            width={18}
            x={57}
            y={88}
          />
          <rect
            className="origin-center fill-black transform-fill"
            data-part="eye"
            height={38}
            rx={10}
            width={20}
            x={110}
            y={86}
          />
        </mask>
      </defs>
      {/* Swings about the base of the sphere. */}
      <g className="origin-[80px_115px]" data-part="body">
        <path d={BODY} mask={`url(#${maskId})`} />
      </g>
    </svg>
  );
};
