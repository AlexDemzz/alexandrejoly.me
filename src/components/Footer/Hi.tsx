"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  useSprings,
  animated,
  config,
  useIsomorphicLayoutEffect,
  useInView,
} from "@react-spring/web";
import { HI_LANGUAGES } from "@/lib/constants";

const Hi = () => {
  const [ref, inView] = useInView();
  const items = HI_LANGUAGES;
  const itemHeight = 24;
  const visible = 3;
  const totalHeight = items.length * itemHeight;

  const idx = useCallback(
    (x, l = items.length) => (x < 0 ? x + l : x) % l,
    [items]
  );
  const getPos = useCallback(
    (i, firstVis, firstVisIdx) => idx(i - firstVis + firstVisIdx),
    [idx]
  );

  const [springs, api] = useSprings(items.length, (i) => ({
    y: (i < items.length - 1 ? i : -1) * itemHeight,
    config: config.wobbly,
  }));

  const prev = useRef([0, 1]);
  const [scrollPos, setScroll] = useState(0);

  const runSprings = useCallback(
    (y, vy) => {
      const firstVis = idx(Math.floor(y / itemHeight) % items.length);
      const firstVisIdx = vy < 0 ? items.length - visible - 1 : 1;
      api.start((i) => {
        const position = getPos(i, firstVis, firstVisIdx);
        const prevPosition = getPos(i, prev.current[0], prev.current[1]);
        const rank =
          firstVis - (y < 0 ? items.length : 0) + position - firstVisIdx;
        return {
          y: (-y % totalHeight) + itemHeight * rank,
          immediate: vy < 0 ? prevPosition > position : prevPosition < position,
        };
      });
      prev.current = [firstVis, firstVisIdx];
    },
    [idx, getPos, itemHeight, visible, api, items.length, totalHeight]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setScroll((prev) => prev + itemHeight);
    }, 2000);
    return () => clearInterval(interval);
  }, [itemHeight]);

  useIsomorphicLayoutEffect(() => {
    if (inView) {
      runSprings(scrollPos, 100);
    }
  }, [scrollPos, runSprings, inView]);

  return (
    <div className="overflow-hidden h-6 relative w-full" ref={ref}>
      {springs.map((props, i) => (
        <animated.div
          key={i}
          className={"absolute h-6 font-bold"}
          style={props}
        >
          {items[i]}
        </animated.div>
      ))}
    </div>
  );
};

export default React.memo(Hi);
