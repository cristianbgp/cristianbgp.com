import { describe, expect, test } from "bun:test";

import { getTimelineNodeProgress } from "./resume-timeline";
import * as timeline from "./resume-timeline";

describe("getTimelineNodeProgress", () => {
  test("maps a node position to the timeline progress", () => {
    expect(getTimelineNodeProgress(0, 400)).toBe(0);
    expect(getTimelineNodeProgress(100, 400)).toBe(0.25);
    expect(getTimelineNodeProgress(400, 400)).toBe(1);
  });

  test("keeps node progress within valid boundaries", () => {
    expect(getTimelineNodeProgress(-20, 400)).toBe(0);
    expect(getTimelineNodeProgress(500, 400)).toBe(1);
    expect(getTimelineNodeProgress(20, 0)).toBe(0);
  });
});

describe("resume timeline dates", () => {
  test("formats ISO dates without shifting them across timezones", () => {
    const formatResumeDate = (
      timeline as typeof timeline & {
        formatResumeDate?: (date: string) => string;
      }
    ).formatResumeDate;

    expect(formatResumeDate?.("2022-04-01")).toBe("Apr 2022");
  });

  test("describes complete work durations in years and months", () => {
    const getResumeDuration = (
      timeline as typeof timeline & {
        getResumeDuration?: (start: string, end: string) => string;
      }
    ).getResumeDuration;

    expect(getResumeDuration?.("2022-04-01", "2025-12-19")).toBe(
      "(3 years, 9 months)",
    );
    expect(getResumeDuration?.("2019-02-25", "2019-08-09")).toBe(
      "(5 months)",
    );
  });
});
