import { describe, expect, test } from "bun:test";

import {
  addLayer,
  insertLayer,
  moveLayer,
  removeLayer,
} from "./poster-layers";

type Layer = { id: string; zIndex: number };

describe("poster layers", () => {
  test("keeps layer indices unique and contiguous after removal and upload", () => {
    const remaining = removeLayer<Layer>(
      [
        { id: "back", zIndex: 1 },
        { id: "middle", zIndex: 2 },
        { id: "front", zIndex: 3 },
      ],
      "middle",
    );

    expect(addLayer(remaining, { id: "new", zIndex: 0 })).toEqual([
      { id: "back", zIndex: 1 },
      { id: "front", zIndex: 2 },
      { id: "new", zIndex: 3 },
    ]);
  });

  test("moves layers without producing negative or duplicate indices", () => {
    const layers = [
      { id: "back", zIndex: -4 },
      { id: "middle", zIndex: 7 },
      { id: "front", zIndex: 7 },
    ];

    expect(moveLayer(layers, "front", "back")).toEqual([
      { id: "front", zIndex: 1 },
      { id: "back", zIndex: 2 },
      { id: "middle", zIndex: 3 },
    ]);
    expect(moveLayer(layers, "back", "up")).toEqual([
      { id: "middle", zIndex: 1 },
      { id: "back", zIndex: 2 },
      { id: "front", zIndex: 3 },
    ]);
  });

  test("inserts a restored layer at its previous stack position", () => {
    expect(
      insertLayer(
        [
          { id: "back", zIndex: 1 },
          { id: "front", zIndex: 2 },
        ],
        { id: "restored", zIndex: 99 },
        1,
      ),
    ).toEqual([
      { id: "back", zIndex: 1 },
      { id: "restored", zIndex: 2 },
      { id: "front", zIndex: 3 },
    ]);
  });
});
