import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

import {
  clamp,
  getActiveHeadingIndex,
  getNearestProgressIndex,
  getPreviewPanelOffset,
  getRailGestureEndAction,
  getRailDragProgress,
  getRailDashScale,
  getRailDragScrollTop,
  getRailSegmentProgresses,
  getRailViewportOffset,
  getReadingProgress,
  getScrollTopForProgress,
  hasRailDragMoved,
  isReadingRailInteractive,
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

type ActiveDrag = {
  moved: boolean;
  orientation: "vertical" | "horizontal";
  pointerId: number;
  startPosition: number;
  startProgress: number;
  startScrollTop: number;
  trackLength: number;
  useControlledGain: boolean;
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
const MOBILE_DRAG_GAIN = 5;
const DRAG_THRESHOLD = 6;

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
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const pendingDragPositionRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const { scrollY } = useScroll();

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

  const applyDragPosition = useCallback(
    (drag: ActiveDrag, currentPosition: number) => {
      const offset = getRailViewportOffset(
        drag.startPosition,
        currentPosition,
      );
      const { start, end } = metricsRef.current;
      const nextScrollTop = drag.useControlledGain
        ? getRailDragScrollTop(
            drag.startScrollTop,
            offset,
            MOBILE_DRAG_GAIN,
            start,
            end,
          )
        : getScrollTopForProgress(
            getRailDragProgress(
              drag.startProgress,
              0,
              offset,
              drag.trackLength,
            ),
            start,
            end,
          );

      window.scrollTo({ top: nextScrollTop, behavior: "auto" });
    },
    [],
  );

  const scheduleDragPosition = useCallback(
    (currentPosition: number) => {
      pendingDragPositionRef.current = currentPosition;
      if (dragFrameRef.current !== null) return;

      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        const drag = activeDragRef.current;
        const pendingPosition = pendingDragPositionRef.current;
        pendingDragPositionRef.current = null;
        if (!drag || pendingPosition === null) return;

        applyDragPosition(drag, pendingPosition);
      });
    },
    [applyDragPosition],
  );

  const handleTrackTap = useCallback(
    (
      point: { x: number; y: number },
      orientation: ActiveDrag["orientation"],
    ) => {
      const track =
        orientation === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      const bounds = track?.getBoundingClientRect();
      if (!bounds) return;

      const position =
        orientation === "vertical"
          ? point.y - bounds.top
          : point.x - bounds.left;
      const length = orientation === "vertical" ? bounds.height : bounds.width;
      scrollToProgress(length > 0 ? clamp(position / length, 0, 1) : 0);
    },
    [scrollToProgress],
  );

  const handleTrackPointerDown = useCallback(
    (
      event: PointerEvent<HTMLDivElement>,
      orientation: ActiveDrag["orientation"],
    ) => {
      if (!isReadingRailInteractive(window.innerWidth, event.pointerType)) {
        return;
      }

      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;

      const bounds = event.currentTarget.getBoundingClientRect();
      activeDragRef.current = {
        moved: false,
        orientation,
        pointerId: event.pointerId,
        startPosition:
          orientation === "vertical" ? event.clientY : event.clientX,
        startProgress: progressRef.current,
        startScrollTop: window.scrollY,
        trackLength:
          orientation === "vertical" ? bounds.height : bounds.width,
        useControlledGain:
          window.innerWidth < 1280 || event.pointerType !== "mouse",
      };
      event.preventDefault();
    },
    [],
  );

  useEffect(() => {
    const getEventPosition = (
      event: globalThis.PointerEvent,
      orientation: ActiveDrag["orientation"],
    ) => (orientation === "vertical" ? event.clientY : event.clientX);

    const cancelScheduledDrag = () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;
    };

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      if (event.cancelable) event.preventDefault();
      const currentPosition = getEventPosition(event, drag.orientation);
      if (!drag.moved) {
        drag.moved = hasRailDragMoved(
          drag.startPosition,
          currentPosition,
          DRAG_THRESHOLD,
        );
      }
      if (!drag.moved) return;

      scheduleDragPosition(currentPosition);
    };

    const finishPointerGesture = (
      event: globalThis.PointerEvent,
      cancelled: boolean,
    ) => {
      const drag = activeDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const action = getRailGestureEndAction(
        event.pointerType,
        drag.moved,
        cancelled,
      );
      const pendingPosition = pendingDragPositionRef.current;
      cancelScheduledDrag();

      if (action === "flush-drag" && pendingPosition !== null) {
        applyDragPosition(drag, pendingPosition);
      } else if (action === "tap") {
        handleTrackTap(
          { x: event.clientX, y: event.clientY },
          drag.orientation,
        );
      }

      activeDragRef.current = null;

      const track =
        drag.orientation === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      const bounds = track?.getBoundingClientRect();
      const endedInsideTrack = bounds
        ? event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom
        : false;
      if (event.pointerType !== "mouse" || !endedInsideTrack || cancelled) {
        restoreReadingWave();
      }
    };

    const handlePointerUp = (event: globalThis.PointerEvent) =>
      finishPointerGesture(event, false);
    const handlePointerCancel = (event: globalThis.PointerEvent) =>
      finishPointerGesture(event, true);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      cancelScheduledDrag();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [
    applyDragPosition,
    handleTrackTap,
    restoreReadingWave,
    scheduleDragPosition,
  ]);

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

  const updateReadingPosition = useCallback(
    (scrollTop: number) => {
      const { start, end, headingTops } = metricsRef.current;
      const progress = getReadingProgress(scrollTop, start, end);
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
        scrollTop + window.innerHeight * 0.28,
      );
      if (nextActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }
    },
    [updateDashWave],
  );

  useMotionValueEvent(scrollY, "change", updateReadingPosition);

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
      updateReadingPosition(window.scrollY);
    };

    dashElementsRef.current = [
      ...(rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-reading-dash]",
      ) ?? []),
    ];
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(articleRoot);
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [updateReadingPosition]);

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
            if (event.pointerType === "mouse") {
              handleVerticalPointerMove(event);
            }
            handleTrackPointerDown(event, "vertical");
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "mouse" && !activeDragRef.current) {
              handleVerticalPointerMove(event);
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse" && !activeDragRef.current) {
              restoreReadingWave();
            }
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
