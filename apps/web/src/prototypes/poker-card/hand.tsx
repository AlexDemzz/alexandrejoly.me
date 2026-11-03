// PROTOTYPE, throw me away: the hand of five that the deck deals, one card
// per Lighthouse audit plus is-agentic, each turning to a gauge at 100.
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { AUDITS, CardBack, CornerIndex, Gauge, VercelLogo } from "./parts";

export const HAND = [
  ...AUDITS.map((audit) => ({ label: audit.label, suit: audit.suit })),
  { label: "is-agentic", suit: <VercelLogo className="size-[5.5cqw]" /> },
];

const DEAL_STEP = 90;
const FLIP_START = 520;
const FLIP_STEP = 170;
const LIT_AFTER = FLIP_START + FLIP_STEP * (HAND.length - 1) + 900;

export const useLit = (open: boolean) => {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    setLit(false);
    if (!open) {
      return;
    }
    const timer = window.setTimeout(() => setLit(true), LIT_AFTER);
    return () => window.clearTimeout(timer);
  }, [open]);
  return lit;
};

export const RoyalHand = ({
  open,
  lit,
  onToggle,
  size,
}: {
  open: boolean;
  lit: boolean;
  onToggle: () => void;
  // Overrides the hand's `--card-w` and `--pitch`.
  size?: CSSProperties;
}) => {
  const last = HAND.length - 1;
  return (
    <button
      aria-label={open ? "Gather the hand" : "Deal the hand"}
      className={`pk-hand block cursor-[inherit] ${lit ? "pk-lit" : ""}`}
      onClick={onToggle}
      style={{ ...size, width: "calc(var(--card-w) + 4 * var(--pitch))" }}
      type="button"
    >
      {HAND.map((card, index) => {
        const offset = index - last / 2;
        const slotTransform = open
          ? `translateX(calc(${offset} * var(--pitch))) translateY(${Math.abs(offset) * 14}px) rotate(${offset * 5}deg)`
          : `translate(${(last - index) * -2}px, ${(last - index) * -2}px)`;
        const slotDelay = open ? index * DEAL_STEP : 450 + (last - index) * 60;
        const flipDelay = open
          ? FLIP_START + index * FLIP_STEP
          : (last - index) * 50;
        return (
          <div
            className="pk-slot"
            key={card.label}
            style={
              {
                "--i": index,
                transform: slotTransform,
                transitionDelay: `${slotDelay}ms`,
              } as CSSProperties
            }
          >
            <div className="pk-hop">
              <div
                className="pk-card"
                style={{
                  animation: open
                    ? `pk-lift 800ms var(--ease-settle) ${flipDelay}ms`
                    : "none",
                  transform: open ? "rotateY(180deg)" : "none",
                  transitionDelay: `${flipDelay}ms`,
                }}
              >
                <CardBack />
                <div
                  className="pk-face pk-front"
                  // Hidden faces still raster: keep the fronts out of the deck
                  // until it deals, and hide them only once a card is back down.
                  style={{
                    transition: `visibility 0s linear ${open ? 0 : flipDelay + 800}ms`,
                    visibility: open ? "visible" : "hidden",
                  }}
                >
                  <CornerIndex suit={card.suit} />
                  <CornerIndex flipped suit={card.suit} />
                  <div className="absolute inset-0 grid place-items-center">
                    <Gauge
                      active={open}
                      delay={flipDelay + 150}
                      label={card.label}
                      size="44cqw"
                    />
                  </div>
                  <div className="pk-sheen" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </button>
  );
};
