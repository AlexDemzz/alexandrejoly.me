import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";

import { NextGlyph, PreviousGlyph } from "@/components/glyphs";
import { RegisterMark } from "@/components/register-mark";

import type { Plate } from "./data";
import { PLATES, numberOf } from "./data";

const LAST = PLATES.length - 1;

// A click fired by Enter or Space reports no pointer presses.
const byPointer = (event: MouseEvent) => event.detail > 0;

const wrap = (index: number) => (index + PLATES.length) % PLATES.length;

const STEP_KEYS: Record<string, (current: number) => number> = {
  ArrowLeft: (current) => wrap(current - 1),
  ArrowRight: (current) => wrap(current + 1),
  End: () => LAST,
  Home: () => 0,
};

const PlateView = ({ active, plate }: { active: boolean; plate: Plate }) => {
  const { Demo } = plate;
  return (
    <div
      aria-label={plate.title}
      className="home-plate"
      data-active={active ? "" : undefined}
      id={`home-plate-${plate.id}`}
      inert={!active}
      role="tabpanel"
      style={{ "--home-plate-width": plate.width } as CSSProperties}
    >
      {Demo ? (
        <section
          aria-label={`${plate.title}, preview`}
          className="home-plate-ground"
          data-ground={plate.ground}
        >
          <Demo />
        </section>
      ) : null}
    </div>
  );
};

const PlateCaption = ({ active, plate }: { active: boolean; plate: Plate }) => (
  <div
    className="home-plate-caption"
    data-active={active ? "" : undefined}
    inert={!active}
  >
    <p className="home-plate-caption-label">{plate.label}</p>
    <p>{plate.text}</p>
    {plate.tile ? (
      <p>
        <a className="link" href={`#${plate.tile}`}>
          {numberOf(plate.id)} {plate.title}, its install command and code
        </a>
      </p>
    ) : (
      <p>
        <a className="link" href="#components">
          Every component, register by register
        </a>
      </p>
    )}
  </div>
);

/**
 * One ice stage that walks through the panel and three components, one per
 * register. Every plate stays mounted in the same cell, so the stage is as
 * tall as its tallest plate at every width and never jumps.
 */
export const Stage = () => {
  const [current, setCurrent] = useState(0);
  // Only a pointer change crossfades; a keyboard change is instant.
  const [fade, setFade] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const marks = useRef<(HTMLButtonElement | null)[]>([]);
  const plate = PLATES[current];

  const step = (next: number, event: MouseEvent) => {
    const index = wrap(next);
    setFade(byPointer(event));
    setCurrent(index);
    setAnnouncement(`${PLATES[index].title}, ${index + 1} of ${PLATES.length}`);
  };

  const onMarksKeyDown = (event: KeyboardEvent) => {
    const move = STEP_KEYS[event.key];
    if (!move) {
      return;
    }
    event.preventDefault();
    const index = move(current);
    setFade(false);
    setCurrent(index);
    marks.current[index]?.focus();
  };

  return (
    <div className="home-viewer">
      <section aria-label="Component viewer" className="home-stage">
        <p className="home-stage-label">
          <span className="home-stage-register">
            <RegisterMark register={plate.register} />
            {plate.registerLabel}
            <span aria-hidden="true" className="home-stage-count">
              {current + 1} / {PLATES.length}
            </span>
          </span>
          <span>{plate.title}</span>
        </p>
        <button
          aria-label="Previous view"
          className="home-arrow"
          data-side="start"
          onClick={(event) => step(current - 1, event)}
          type="button"
        >
          <PreviousGlyph />
        </button>
        <button
          aria-label="Next view"
          className="home-arrow"
          data-side="end"
          onClick={(event) => step(current + 1, event)}
          type="button"
        >
          <NextGlyph />
        </button>
        <div className="home-plates" data-fade={fade ? "" : undefined}>
          {PLATES.map((entry, index) => (
            <PlateView
              active={index === current}
              key={entry.id}
              plate={entry}
            />
          ))}
        </div>
        {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus -- the tabs carry focus, one stop with a roving tabindex */}
        <div
          aria-label="Choose a view"
          className="home-marks"
          onKeyDown={onMarksKeyDown}
          role="tablist"
        >
          {PLATES.map((entry, index) => (
            <button
              aria-controls={`home-plate-${entry.id}`}
              aria-label={entry.title}
              aria-selected={index === current}
              className="home-mark"
              key={entry.id}
              onClick={(event) => {
                setFade(byPointer(event));
                setCurrent(index);
              }}
              ref={(node) => {
                marks.current[index] = node;
              }}
              role="tab"
              tabIndex={index === current ? 0 : -1}
              type="button"
            />
          ))}
        </div>
      </section>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="home-plate-captions">
        {PLATES.map((entry, index) => (
          <PlateCaption
            active={index === current}
            key={entry.id}
            plate={entry}
          />
        ))}
      </div>
    </div>
  );
};
