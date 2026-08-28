import { describe, expect, test } from "bun:test";

import { parseJsonInput } from "./json-input";

describe("parseJsonInput", () => {
  test("returns parsed data for valid JSON", () => {
    expect(parseJsonInput('{"name":"Cristian","active":true}')).toEqual({
      ok: true,
      value: { name: "Cristian", active: true },
    });
  });

  test("returns a useful message for malformed JSON", () => {
    const result = parseJsonInput('{"name":}');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).not.toBe("Invalid input");
    }
  });
});
