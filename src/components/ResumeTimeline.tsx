"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  memo,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  formatResumeDate,
  getResumeDuration,
  getTimelineNodeProgress,
} from "@/lib/resume-timeline";

type Work = {
  company: string;
  position: string;
  summary: string;
  website: string;
  startDate: string;
  endDate?: string;
};

type Education = {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
};

type ResumeTimelineProps = {
  work: Work[];
  education: Education[];
  referenceDate: string;
};

type TimelineGeometry = {
  height: number;
  nodeProgresses: number[];
  scrollEnd: number;
  scrollStart: number;
  top: number;
};

const EMPTY_GEOMETRY: TimelineGeometry = {
  height: 0,
  nodeProgresses: [],
  scrollEnd: 1,
  scrollStart: 0,
  top: 0,
};

const TimelineNode = memo(forwardRef<HTMLSpanElement, {
  progress: MotionValue<number>;
  reduceMotion: boolean;
  threshold: number;
}>(function TimelineNode({ progress, reduceMotion, threshold }, ref) {
  const activationStart = Math.max(threshold - 0.035, 0);
  const scale = useTransform(
    progress,
    [activationStart, Math.max(threshold, 0.001)],
    [0.45, 1],
  );
  const opacity = useTransform(
    progress,
    [activationStart, Math.max(threshold, 0.001)],
    [0, 1],
  );

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute -left-7 top-2 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background sm:-left-8"
      data-resume-timeline-node
    >
      <motion.span
        className="size-1.5 rounded-full bg-primary"
        style={reduceMotion ? undefined : { opacity, scale }}
      />
    </span>
  );
}));

export const ResumeTimeline = memo(function ResumeTimeline({
  work,
  education,
  referenceDate,
}: ResumeTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [geometry, setGeometry] = useState(EMPTY_GEOMETRY);
  const reduceMotion = Boolean(useReducedMotion());
  const { scrollY } = useScroll();
  const timelineProgress = useTransform(
    scrollY,
    [geometry.scrollStart, geometry.scrollEnd],
    [0, 1],
  );
  const firstProgress = geometry.nodeProgresses.at(0) ?? 0;
  const lastProgress = geometry.nodeProgresses.at(-1) ?? 1;
  const activeLineScale = useTransform(
    timelineProgress,
    [firstProgress, Math.max(lastProgress, firstProgress + 0.001)],
    [0, 1],
  );

  const setMarkerRef = useCallback(
    (index: number) => (node: HTMLSpanElement | null) => {
      markerRefs.current[index] = node;
    },
    [],
  );

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || markerRefs.current.length === 0) return;

    const measure = () => {
      const timelineRect = timeline.getBoundingClientRect();
      const timelineLength = timelineRect.height;
      const offsets = markerRefs.current.flatMap((marker) => {
        if (!marker) return [];
        const markerRect = marker.getBoundingClientRect();
        return [markerRect.top - timelineRect.top + markerRect.height / 2];
      });
      const firstOffset = offsets.at(0) ?? 0;
      const lastOffset = offsets.at(-1) ?? firstOffset;

      setGeometry({
        top: firstOffset,
        height: Math.max(lastOffset - firstOffset, 0),
        scrollStart:
          timelineRect.top + window.scrollY - window.innerHeight * 0.55,
        scrollEnd:
          timelineRect.bottom + window.scrollY - window.innerHeight * 0.55,
        nodeProgresses: offsets.map((offset) =>
          getTimelineNodeProgress(offset, timelineLength),
        ),
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(timeline);
    markerRefs.current.forEach((marker) => {
      if (marker) resizeObserver.observe(marker);
    });

    return () => resizeObserver.disconnect();
  }, [education.length, work.length]);

  let nodeIndex = 0;

  return (
    <section aria-labelledby="experience-heading">
      <h2 id="experience-heading" className="mb-3 text-xl font-semibold">
        Experience
      </h2>
      <div
        ref={timelineRef}
        className="relative ml-1 space-y-8 pl-7 sm:ml-2 sm:pl-8"
        data-resume-timeline
      >
        {geometry.height > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 w-px -translate-x-1/2 bg-border"
            style={{ top: geometry.top, height: geometry.height }}
          >
            <motion.span
              className="block h-full w-full origin-top bg-primary"
              style={{ scaleY: reduceMotion ? 1 : activeLineScale }}
            />
          </span>
        )}

        {work.map((job) => {
          const currentNodeIndex = nodeIndex++;
          return (
            <article
              className="relative break-inside-avoid"
              key={`${job.company}-${job.startDate}`}
            >
              <TimelineNode
                ref={setMarkerRef(currentNodeIndex)}
                progress={timelineProgress}
                reduceMotion={reduceMotion}
                threshold={geometry.nodeProgresses[currentNodeIndex] ?? 0}
              />
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                <div className="text-base font-medium">
                  <a
                    href={job.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {job.company}
                  </a>{" "}
                  - {job.position}
                </div>
                <div className="shrink-0 text-sm text-muted-foreground">
                  {formatResumeDate(job.startDate)} -{" "}
                  {job.endDate ? formatResumeDate(job.endDate) : "Present"}{" "}
                  {getResumeDuration(
                    job.startDate,
                    job.endDate ?? referenceDate,
                  )}
                </div>
              </div>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                {job.summary}
              </div>
            </article>
          );
        })}

        {education.length > 0 && (
          <div className="space-y-6 pt-2">
            <h2 className="text-xl font-semibold">Education</h2>
            {education.map((entry) => {
              const currentNodeIndex = nodeIndex++;
              return (
                <article
                  className="relative break-inside-avoid"
                  key={`${entry.institution}-${entry.startDate}`}
                >
                  <TimelineNode
                    ref={setMarkerRef(currentNodeIndex)}
                    progress={timelineProgress}
                    reduceMotion={reduceMotion}
                    threshold={
                      geometry.nodeProgresses[currentNodeIndex] ?? 0
                    }
                  />
                  <div className="font-medium">{entry.institution}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.area} ({entry.studyType})
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatResumeDate(entry.startDate)} -{" "}
                    {formatResumeDate(entry.endDate)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
});
