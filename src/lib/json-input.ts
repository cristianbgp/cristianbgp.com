export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export function parseJsonInput(input: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not parse JSON.",
    };
  }
}
