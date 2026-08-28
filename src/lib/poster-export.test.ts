import { describe, expect, test } from "bun:test";

import { renderLayersInOrder } from "./poster-export";

describe("renderLayersInOrder", () => {
  test("draws by z-index even when decoding completes out of order", async () => {
    const decoded: string[] = [];
    const drawn: string[] = [];

    await renderLayersInOrder(
      [
        { id: "front", zIndex: 2 },
        { id: "back", zIndex: 1 },
      ],
      async (layer) => {
        await Bun.sleep(layer.id === "back" ? 10 : 0);
        decoded.push(layer.id);
        return `${layer.id}-image`;
      },
      (image, layer) => drawn.push(`${layer.id}:${image}`),
    );

    expect(decoded).toEqual(["front", "back"]);
    expect(drawn).toEqual(["back:back-image", "front:front-image"]);
  });
});
