type OrderedLayer = {
  zIndex: number;
};

export async function renderLayersInOrder<TLayer extends OrderedLayer, TImage>(
  layers: TLayer[],
  load: (layer: TLayer) => Promise<TImage>,
  draw: (image: TImage, layer: TLayer) => void,
): Promise<void> {
  const ordered = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  const loaded = await Promise.all(
    ordered.map(async (layer) => ({ layer, image: await load(layer) })),
  );

  loaded.forEach(({ image, layer }) => draw(image, layer));
}
