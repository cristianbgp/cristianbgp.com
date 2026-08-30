"use client";

import { memo } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { CommandKeyTrigger } from "@/components/AppCommand";
import { getArticlesHeaderProgress } from "@/lib/articles";

export const ArticlesStickyTitle = memo(function ArticlesStickyTitle() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (scrollTop) =>
    getArticlesHeaderProgress(scrollTop, Boolean(reduceMotion)),
  );
  const titleScale = useTransform(progress, [0, 1], [1, 0.72]);
  const titleY = useTransform(progress, [0, 1], [0, 14]);
  const hintOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  const hintY = useTransform(progress, [0, 1], [0, -6]);
  const hintVisibility = useTransform(progress, (value) =>
    value >= 0.55 ? "hidden" : "visible",
  );
  const hintPointerEvents = useTransform(progress, (value) =>
    value >= 0.2 ? "none" : "auto",
  );

  return (
    <header
      className="relative mx-auto flex h-20 w-full max-w-2xl justify-center px-6 pt-1"
      data-articles-sticky-title
    >
      <motion.h1
        className="origin-center text-balance text-4xl font-bold leading-tight text-foreground will-change-transform"
        style={{ scale: titleScale, y: titleY }}
      >
        Articles
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
