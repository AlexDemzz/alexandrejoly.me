"use client";

import Link, { LinkProps } from "next/link";
import React, {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  ForwardRefRenderFunction,
  useRef,
  useState,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { DEFAULT_TRANSITION } from "@/lib/constants";
import { useMeasure } from "@uidotdev/usehooks";

type AnimatedLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> &
  LinkProps;

const AnimatedLink: ForwardRefRenderFunction<
  HTMLAnchorElement,
  AnimatedLinkProps
> = ({ href, children, className, target, ...props }, ref) => {
  const [innerRef, { height }] = useMeasure();

  return (
    <Link href={href} passHref legacyBehavior {...props}>
      <a
        ref={ref}
        style={{
          position: "relative",
          overflow: "hidden",
          height: `${height}px`,
        }}
        target={target}
        className={`flex flex-col ${className}`}
      >
        <motion.div
          initial={{ y: 0 }}
          whileHover={{ y: `-${height}px` }}
          transition={{ ...DEFAULT_TRANSITION }}
        >
          <span ref={innerRef} style={{ display: "block" }}>
            {children}
          </span>
          <span>{children}</span>
        </motion.div>
      </a>
    </Link>
  );
};

export default React.forwardRef(AnimatedLink);
