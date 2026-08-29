import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  clamp,
  getActiveHeadingIndex,
  getNearestProgressIndex,
  getPreviewPanelOffset,
  getRailPointerTransition,
  getRailDashScale,
  getRailSegmentProgresses,
  getReadingProgress,
  getScrollTopForProgress,
} from "@/lib/reading-rail";

type Heading = {
  id: string;
  label: string;
  level: 2 | 3;
  progress: number;
};

type RailSide = "left" | "right";

type ArticleReadingRailProps = {
  side?: RailSide;
  desktopSide?: RailSide;
};

type ReadingMetrics = {
  start: number;
  end: number;
  headingTops: number[];
  headingTargets: number[];
};

type RailStyle = CSSProperties & {
  "--heading-progress"?: number;
  "--reading-progress"?: number;
};

const EMPTY_METRICS: ReadingMetrics = {
  start: 0,
  end: 0,
  headingTops: [],
  headingTargets: [],
};

const HEADING_SELECTOR =
  "[data-article-body] h2[id], [data-article-body] h3[id]";
const RAIL_SEGMENTS = getRailSegmentProgresses(56);

export function ArticleReadingRail({
  side = "left",
  desktopSide = "left",
}: ArticleReadingRailProps) {
  const rootRef = useRef<HTMLElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const headingDataRef = useRef<Heading[]>([]);
  const dashElementsRef = useRef<HTMLElement[]>([]);
  const metricsRef = useRef<ReadingMetrics>(EMPTY_METRICS);
  const trackLengthsRef = useRef({ vertical: 0, horizontal: 0 });
  const progressRef = useRef(0);
  const progressPercentRef = useRef(0);
  const activeIndexRef = useRef(-1);
  const draggingRef = useRef<"vertical" | "horizontal" | null>(null);
  const hoveringRef = useRef(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const updateDashWave = useCallback((focusProgress: number) => {
    dashElementsRef.current.forEach((dash, index) => {
      const scale = getRailDashScale(
        RAIL_SEGMENTS[index],
        focusProgress,
        0.085,
      );
      const strength = (scale - 1) / 3.5;
      dash.style.setProperty("--dash-scale", String(scale));
      dash.style.setProperty(
        "--dash-opacity",
        String(0.32 + strength * 0.68),
      );
    });
  }, []);

  const restoreReadingWave = useCallback(() => {
    hoveringRef.current = false;
    updateDashWave(progressRef.current);
    setPreviewIndex(null);
  }, [updateDashWave]);

  const scrollToProgress = useCallback((progress: number) => {
    const { start, end } = metricsRef.current;
    window.scrollTo({
      top: getScrollTopForProgress(progress, start, end),
      behavior: "auto",
    });
  }, []);

  const getPointerProgress = useCallback(
    (
      event: PointerEvent<HTMLElement>,
      orientation: "vertical" | "horizontal",
    ) => {
      const track =
        orientation === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      if (!track) return 0;

      const bounds = track.getBoundingClientRect();
      const position =
        orientation === "vertical"
          ? event.clientY - bounds.top
          : event.clientX - bounds.left;
      const length =
        orientation === "vertical" ? bounds.height : bounds.width;

      return length > 0 ? clamp(position / length, 0, 1) : 0;
    },
    [],
  );

  const handleTrackPointerDown = useCallback(
    (
      event: PointerEvent<HTMLDivElement>,
      orientation: "vertical" | "horizontal",
    ) => {
      const transition = getRailPointerTransition(false, "press");
      draggingRef.current = transition.dragging ? orientation : null;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (transition.shouldScroll) {
        scrollToProgress(getPointerProgress(event, orientation));
      }
    },
    [getPointerProgress, scrollToProgress],
  );

  const handleTrackPointerMove = useCallback(
    (
      event: PointerEvent<HTMLDivElement>,
      orientation: "vertical" | "horizontal",
    ) => {
      const transition = getRailPointerTransition(
        draggingRef.current === orientation,
        "move",
      );
      draggingRef.current = transition.dragging ? orientation : null;
      if (transition.shouldScroll) {
        scrollToProgress(getPointerProgress(event, orientation));
      }
    },
    [getPointerProgress, scrollToProgress],
  );

  const handleTrackPointerEnd = useCallback(
    (
      event: PointerEvent<HTMLDivElement>,
      phase: "release" | "cancel" | "leave",
    ) => {
      const transition = getRailPointerTransition(
        draggingRef.current !== null,
        phase,
      );
      draggingRef.current = transition.dragging
        ? draggingRef.current
        : null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  const handleVerticalPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const track = verticalTrackRef.current;
      if (!track) return;

      const bounds = track.getBoundingClientRect();
      const pointerPosition = clamp(event.clientY - bounds.top, 0, bounds.height);
      const pointerProgress =
        bounds.height > 0 ? pointerPosition / bounds.height : 0;
      const headingIndex = getNearestProgressIndex(
        headingDataRef.current.map((heading) => heading.progress),
        pointerProgress,
      );
      const panelHeight = 84;
      const panelY = getPreviewPanelOffset(
        pointerProgress,
        bounds.height,
        panelHeight,
      );

      hoveringRef.current = true;
      updateDashWave(pointerProgress);
      rootRef.current?.style.setProperty("--preview-y", `${panelY}px`);
      setPreviewIndex(headingIndex >= 0 ? headingIndex : null);
    },
    [updateDashWave],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const changes: Record<string, number> = {
        ArrowDown: 0.025,
        ArrowRight: 0.025,
        ArrowUp: -0.025,
        ArrowLeft: -0.025,
        PageDown: 0.1,
        PageUp: -0.1,
        Home: -Infinity,
        End: Infinity,
      };
      const change = changes[event.key];
      if (change === undefined) return;

      event.preventDefault();
      const nextProgress =
        change === Infinity
          ? 1
          : change === -Infinity
            ? 0
            : progressRef.current + change;
      scrollToProgress(nextProgress);
    },
    [scrollToProgress],
  );

  useEffect(() => {
    const articleRoot = document.querySelector<HTMLElement>(
      "[data-article-root]",
    );
    const articleBody = document.querySelector<HTMLElement>(
      "[data-article-body]",
    );
    if (!articleRoot || !articleBody) return;

    const headingElements = Array.from(
      articleBody.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
    );
    const measure = () => {
      const rootBounds = articleRoot.getBoundingClientRect();
      const start = rootBounds.top + window.scrollY;
      const end = Math.max(
        start,
        rootBounds.bottom + window.scrollY - window.innerHeight,
      );
      const headingTops = headingElements.map(
        (heading) => heading.getBoundingClientRect().top + window.scrollY,
      );
      const headingTargets = headingTops.map((top) =>
        clamp(top - window.innerHeight * 0.28, start, end),
      );

      metricsRef.current = { start, end, headingTops, headingTargets };
      trackLengthsRef.current = {
        vertical: verticalTrackRef.current?.clientHeight ?? 0,
        horizontal: horizontalTrackRef.current?.clientWidth ?? 0,
      };
      const nextHeadings: Heading[] = headingElements.map((heading, index) => ({
        id: heading.id,
        label: heading.textContent?.trim() || `Section ${index + 1}`,
        level: heading.tagName === "H3" ? 3 : 2,
        progress: getReadingProgress(headingTargets[index], start, end),
      }));
      headingDataRef.current = nextHeadings;
      setHeadings(nextHeadings);
    };

    measure();
    dashElementsRef.current = [
      ...(rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-reading-dash]",
      ) ?? []),
    ];
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(articleRoot);
    window.addEventListener("resize", measure);

    let frame = 0;
    const updateReadingPosition = () => {
      const { start, end, headingTops } = metricsRef.current;
      const progress = getReadingProgress(window.scrollY, start, end);
      progressRef.current = progress;
      if (!hoveringRef.current) updateDashWave(progress);
      rootRef.current?.style.setProperty(
        "--reading-progress",
        String(progress),
      );
      rootRef.current?.style.setProperty(
        "--vertical-thumb-y",
        `${progress * Math.max(trackLengthsRef.current.vertical - 6, 0)}px`,
      );
      rootRef.current?.style.setProperty(
        "--horizontal-thumb-x",
        `${progress * Math.max(trackLengthsRef.current.horizontal - 6, 0)}px`,
      );

      const nextPercent = Math.round(progress * 100);
      if (nextPercent !== progressPercentRef.current) {
        progressPercentRef.current = nextPercent;
        setProgressPercent(nextPercent);
      }

      const nextActiveIndex = getActiveHeadingIndex(
        headingTops,
        window.scrollY + window.innerHeight * 0.28,
      );
      if (nextActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }

      frame = window.requestAnimationFrame(updateReadingPosition);
    };
    frame = window.requestAnimationFrame(updateReadingPosition);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [updateDashWave]);

  const sliderProps = {
    role: "slider",
    tabIndex: -1,
    "aria-label": "Reading position",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": progressPercent,
    "aria-valuetext": `${progressPercent}% read`,
    onKeyDown: handleKeyDown,
  } as const;

  return (
    <nav
      ref={rootRef}
      aria-label="Article sections"
      className="article-reading-rail"
      data-side={side}
      data-desktop-side={desktopSide}
      style={{ "--reading-progress": 0 } as RailStyle}
    >
      <div
        className="article-reading-rail__desktop"
        data-rail-orientation="vertical"
      >
        <div
          {...sliderProps}
          ref={verticalTrackRef}
          aria-orientation="vertical"
          className="article-reading-rail__track article-reading-rail__track--vertical"
          onPointerDown={(event) => {
            handleVerticalPointerMove(event);
            handleTrackPointerDown(event, "vertical");
          }}
          onPointerMove={(event) => {
            handleVerticalPointerMove(event);
            handleTrackPointerMove(event, "vertical");
          }}
          onPointerUp={(event) => {
            handleTrackPointerEnd(event, "release");
            if (event.pointerType !== "mouse") restoreReadingWave();
          }}
          onPointerCancel={(event) => {
            handleTrackPointerEnd(event, "cancel");
            restoreReadingWave();
          }}
          onPointerLeave={(event) => {
            handleTrackPointerEnd(event, "leave");
            restoreReadingWave();
          }}
          onFocus={() => {
            const trackHeight =
              verticalTrackRef.current?.getBoundingClientRect().height ?? 0;
            const headingIndex = getNearestProgressIndex(
              headingDataRef.current.map((heading) => heading.progress),
              progressRef.current,
            );
            hoveringRef.current = true;
            updateDashWave(progressRef.current);
            rootRef.current?.style.setProperty(
              "--preview-y",
              `${getPreviewPanelOffset(progressRef.current, trackHeight, 84)}px`,
            );
            setPreviewIndex(headingIndex >= 0 ? headingIndex : null);
          }}
          onBlur={restoreReadingWave}
        >
          <span className="article-reading-rail__dashes" aria-hidden="true">
            {RAIL_SEGMENTS.map((progress, index) => (
              <span
                key={index}
                className="article-reading-rail__dash"
                data-reading-dash
                data-progress={progress}
              />
            ))}
          </span>
        </div>

        <div
          className="article-reading-rail__preview"
          data-visible={previewIndex !== null ? "true" : "false"}
          aria-hidden="true"
        >
          <p>{previewIndex !== null ? headings[previewIndex]?.label : ""}</p>
        </div>
      </div>

      <div
        {...sliderProps}
        ref={horizontalTrackRef}
        aria-orientation="horizontal"
        className="article-reading-rail__track article-reading-rail__track--horizontal"
        data-rail-orientation="horizontal"
        onPointerDown={(event) =>
          handleTrackPointerDown(event, "horizontal")
        }
        onPointerMove={(event) =>
          handleTrackPointerMove(event, "horizontal")
        }
        onPointerUp={(event) => handleTrackPointerEnd(event, "release")}
        onPointerCancel={(event) => handleTrackPointerEnd(event, "cancel")}
      >
        <span className="article-reading-rail__line" aria-hidden="true">
          <span className="article-reading-rail__fill" />
          <span className="article-reading-rail__thumb" />
        </span>
        {headings.map((heading, index) => (
          <span
            key={heading.id}
            className="article-reading-rail__mobile-marker"
            data-active={activeIndex === index ? "true" : "false"}
            style={{ "--heading-progress": heading.progress } as RailStyle}
            aria-hidden="true"
          />
        ))}
      </div>
    </nav>
  );
}
