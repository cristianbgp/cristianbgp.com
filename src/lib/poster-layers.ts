type Layer = {
  id: string;
  zIndex: number;
};

export type LayerMove = "back" | "down" | "up" | "front";

function normalizeLayers<T extends Layer>(layers: T[]): T[] {
  return [...layers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer, index) => ({ ...layer, zIndex: index + 1 }));
}

export function addLayer<T extends Layer>(layers: T[], layer: T): T[] {
  const ordered = normalizeLayers(layers);
  return [...ordered, { ...layer, zIndex: ordered.length + 1 }];
}

export function removeLayer<T extends Layer>(layers: T[], id: string): T[] {
  return normalizeLayers(layers.filter((layer) => layer.id !== id));
}

export function insertLayer<T extends Layer>(
  layers: T[],
  layer: T,
  index: number,
): T[] {
  const ordered = normalizeLayers(layers);
  const targetIndex = Math.min(Math.max(index, 0), ordered.length);
  ordered.splice(targetIndex, 0, layer);

  return ordered.map((item, itemIndex) => ({
    ...item,
    zIndex: itemIndex + 1,
  }));
}

export function moveLayer<T extends Layer>(
  layers: T[],
  id: string,
  move: LayerMove,
): T[] {
  const ordered = normalizeLayers(layers);
  const currentIndex = ordered.findIndex((layer) => layer.id === id);
  if (currentIndex === -1) return ordered;

  const targetIndex =
    move === "back"
      ? 0
      : move === "front"
        ? ordered.length - 1
        : move === "up"
          ? Math.min(currentIndex + 1, ordered.length - 1)
          : Math.max(currentIndex - 1, 0);

  const [layer] = ordered.splice(currentIndex, 1);
  ordered.splice(targetIndex, 0, layer);

  return ordered.map((item, index) => ({ ...item, zIndex: index + 1 }));
}
