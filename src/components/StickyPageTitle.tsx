"use client";

import { memo, useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { CommandKeyTrigger } from "@/components/AppCommand";
import {
  getStickyPageHeaderPadding,
  getStickyPageHeaderProgress,
} from "@/lib/page-header";

type StickyPageTitleProps = {
  title: string;
};

export const StickyPageTitle = memo(function StickyPageTitle({
  title,
}: StickyPageTitleProps) {
  const titleContainerRef = useRef<HTMLElement>(null);
  const pageHeaderRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (scrollTop) =>
    getStickyPageHeaderProgress(scrollTop, Boolean(reduceMotion)),
  );
  const titleScale = useTransform(progress, [0, 1], [1, 0.72]);
  const titleY = useTransform(progress, [0, 1], [0, 14]);
  const headerPadding = useTransform(progress, getStickyPageHeaderPadding);
  const hintOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  const hintY = useTransform(progress, [0, 1], [0, -6]);
  const hintVisibility = useTransform(progress, (value) =>
    value >= 0.55 ? "hidden" : "visible",
  );
  const hintPointerEvents = useTransform(progress, (value) =>
    value >= 0.2 ? "none" : "auto",
  );

  useEffect(() => {
    const pageHeader = titleContainerRef.current?.closest<HTMLElement>(
      "[data-page-header]",
    );
    pageHeaderRef.current = pageHeader ?? null;
    pageHeader?.style.setProperty(
      "--page-header-padding-y",
      `${headerPadding.get()}px`,
    );

    return () => {
      pageHeader?.style.removeProperty("--page-header-padding-y");
      pageHeaderRef.current = null;
    };
  }, [headerPadding]);

  useMotionValueEvent(headerPadding, "change", (value) => {
    pageHeaderRef.current?.style.setProperty(
      "--page-header-padding-y",
      `${value}px`,
    );
  });

  return (
    <header
      ref={titleContainerRef}
      className="relative mx-auto flex h-20 w-full max-w-2xl justify-center px-6 pt-1"
      data-sticky-page-title
    >
      <motion.h1
        className="origin-center text-balance text-4xl font-bold leading-tight text-foreground will-change-transform"
        style={{ scale: titleScale, y: titleY }}
      >
        {title}
      </motion.h1>
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          opacity: hintOpacity,
          pointerEvents: hintPointerEvents,
          visibility: hintVisibility,
          y: hintY,
        }}
      >
        <CommandKeyTrigger />
      </motion.div>
    </header>
  );
});
