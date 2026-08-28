export const POSTER_WIDTH = 800;
export const POSTER_HEIGHT = 600;
export const MIN_IMAGE_SIZE = 20;

export type Point = {
  x: number;
  y: number;
};

export type PosterRect = Point & {
  width: number;
  height: number;
};

export type ResizeHandle = "nw" | "ne" | "sw" | "se";

type DisplayBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function clientPointToCanvas(
  point: Point,
  bounds: DisplayBounds,
): Point {
  return {
    x: Math.round(((point.x - bounds.left) / bounds.width) * POSTER_WIDTH),
    y: Math.round(((point.y - bounds.top) / bounds.height) * POSTER_HEIGHT),
  };
}

export function moveRect(rect: PosterRect, position: Point): PosterRect {
  return {
    ...rect,
    x: Math.round(clamp(position.x, 0, POSTER_WIDTH - rect.width)),
    y: Math.round(clamp(position.y, 0, POSTER_HEIGHT - rect.height)),
  };
}

export function fitRectToCanvas(rect: PosterRect): PosterRect {
  const scale = Math.min(
    1,
    POSTER_WIDTH / rect.width,
    POSTER_HEIGHT / rect.height,
  );
  const width = Math.round(rect.width * scale);
  const height = Math.round(rect.height * scale);

  return moveRect({ ...rect, width, height }, { x: rect.x, y: rect.y });
}

export function resizeRect(
  rect: PosterRect,
  handle: ResizeHandle,
  horizontalDelta: number,
  aspectRatio: number,
): PosterRect {
  const isWest = handle.endsWith("w");
  const isNorth = handle.startsWith("n");
  const horizontalLimit = isWest
    ? rect.x + rect.width
    : POSTER_WIDTH - rect.x;
  const verticalLimit = isNorth
    ? rect.y + rect.height
    : POSTER_HEIGHT - rect.y;
  const maximumWidth = Math.floor(
    Math.min(horizontalLimit, verticalLimit * aspectRatio),
  );
  const requestedWidth = Math.round(
    rect.width + horizontalDelta * (isWest ? -1 : 1),
  );
  const width = clamp(requestedWidth, MIN_IMAGE_SIZE, maximumWidth);
  const height = Math.round(width / aspectRatio);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  return {
    x: isWest ? right - width : rect.x,
    y: isNorth ? bottom - height : rect.y,
    width,
    height,
  };
}

export function getArrowKeyDelta(
  key: string,
  accelerated: boolean,
): Point | null {
  const distance = accelerated ? 10 : 1;

  switch (key) {
    case "ArrowLeft":
      return { x: -distance, y: 0 };
    case "ArrowRight":
      return { x: distance, y: 0 };
    case "ArrowUp":
      return { x: 0, y: -distance };
    case "ArrowDown":
      return { x: 0, y: distance };
    default:
      return null;
  }
}
