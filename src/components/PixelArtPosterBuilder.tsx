import { useCallback, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { renderLayersInOrder } from "@/lib/poster-export";
import {
  clientPointToCanvas,
  fitRectToCanvas,
  getArrowKeyDelta,
  moveRect,
  POSTER_HEIGHT,
  POSTER_WIDTH,
  resizeRect,
  type Point,
  type PosterRect,
  type ResizeHandle,
} from "@/lib/poster-geometry";
import { addLayer, moveLayer, removeLayer } from "@/lib/poster-layers";

interface ImageItem extends PosterRect {
  id: string;
  src: string;
  originalWidth: number;
  originalHeight: number;
  name: string;
  zIndex: number;
}

type Interaction =
  | {
      type: "drag";
      pointerId: number;
      imageId: string;
      offset: Point;
    }
  | {
      type: "resize";
      pointerId: number;
      imageId: string;
      handle: ResizeHandle;
      startPointer: Point;
      startRect: PosterRect;
      aspectRatio: number;
    };

const RESIZE_HANDLES: Array<{
  handle: ResizeHandle;
  label: string;
  position: string;
}> = [
  { handle: "nw", label: "top left", position: "top-1 left-1 cursor-nw-resize" },
  { handle: "ne", label: "top right", position: "top-1 right-1 cursor-ne-resize" },
  {
    handle: "sw",
    label: "bottom left",
    position: "bottom-1 left-1 cursor-sw-resize",
  },
  {
    handle: "se",
    label: "bottom right",
    position: "right-1 bottom-1 cursor-se-resize",
  },
];

export default function PixelArtPosterBuilder() {
  const { theme } = useTheme();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const interactionRef = useRef<Interaction | null>(null);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;

      return clientPointToCanvas(
        { x: clientX, y: clientY },
        {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
        },
      );
    },
    [],
  );

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const imageElement = new Image();
          imageElement.onload = () => {
            const fittedRect = fitRectToCanvas({
              x: Math.round(Math.random() * 200),
              y: Math.round(Math.random() * 200),
              width: imageElement.width,
              height: imageElement.height,
            });
            const newImage: ImageItem = {
              ...fittedRect,
              id: crypto.randomUUID(),
              src: readerEvent.target?.result as string,
              originalWidth: imageElement.width,
              originalHeight: imageElement.height,
              name: file.name,
              zIndex: 0,
            };

            setImages((currentImages) => addLayer(currentImages, newImage));
            setSelectedImageId(newImage.id);
          };
          imageElement.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  const removeImage = useCallback((imageId: string) => {
    setImages((currentImages) => removeLayer(currentImages, imageId));
    setSelectedImageId((currentId) =>
      currentId === imageId ? null : currentId,
    );
  }, []);

  const resetImageSize = useCallback((imageId: string) => {
    setImages((currentImages) =>
      currentImages.map((image) =>
        image.id === imageId
          ? {
              ...image,
              ...fitRectToCanvas({
                ...image,
                width: image.originalWidth,
                height: image.originalHeight,
              }),
            }
          : image,
      ),
    );
  }, []);

  const scaleImage = useCallback((imageId: string, scale: number) => {
    setImages((currentImages) =>
      currentImages.map((image) =>
        image.id === imageId
          ? {
              ...image,
              ...fitRectToCanvas({
                ...image,
                width: Math.round(image.originalWidth * scale),
                height: Math.round(image.originalHeight * scale),
              }),
            }
          : image,
      ),
    );
  }, []);

  const bringToFront = useCallback((imageId: string) => {
    setImages((currentImages) => moveLayer(currentImages, imageId, "front"));
  }, []);

  const sendToBack = useCallback((imageId: string) => {
    setImages((currentImages) => moveLayer(currentImages, imageId, "back"));
  }, []);

  const moveUp = useCallback((imageId: string) => {
    setImages((currentImages) => moveLayer(currentImages, imageId, "up"));
  }, []);

  const moveDown = useCallback((imageId: string) => {
    setImages((currentImages) => moveLayer(currentImages, imageId, "down"));
  }, []);

  const handleDragStart = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, imageId: string) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const point = getCanvasPoint(event.clientX, event.clientY);
      const image = images.find((candidate) => candidate.id === imageId);
      if (!point || !image) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      interactionRef.current = {
        type: "drag",
        pointerId: event.pointerId,
        imageId,
        offset: { x: point.x - image.x, y: point.y - image.y },
      };
      setSelectedImageId(imageId);
    },
    [getCanvasPoint, images],
  );

  const handleResizeStart = useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      imageId: string,
      handle: ResizeHandle,
    ) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const point = getCanvasPoint(event.clientX, event.clientY);
      const image = images.find((candidate) => candidate.id === imageId);
      if (!point || !image) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      interactionRef.current = {
        type: "resize",
        pointerId: event.pointerId,
        imageId,
        handle,
        startPointer: point,
        startRect: image,
        aspectRatio: image.originalWidth / image.originalHeight,
      };
    },
    [getCanvasPoint, images],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.pointerId !== event.pointerId) return;

      const point = getCanvasPoint(event.clientX, event.clientY);
      if (!point) return;
      event.preventDefault();

      setImages((currentImages) =>
        currentImages.map((image) => {
          if (image.id !== interaction.imageId) return image;

          if (interaction.type === "drag") {
            return {
              ...image,
              ...moveRect(image, {
                x: point.x - interaction.offset.x,
                y: point.y - interaction.offset.y,
              }),
            };
          }

          return {
            ...image,
            ...resizeRect(
              interaction.startRect,
              interaction.handle,
              point.x - interaction.startPointer.x,
              interaction.aspectRatio,
            ),
          };
        }),
      );
    },
    [getCanvasPoint],
  );

  const finishInteraction = useCallback((event: React.PointerEvent) => {
    if (interactionRef.current?.pointerId === event.pointerId) {
      interactionRef.current = null;
    }
  }, []);

  const handleImageKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, imageId: string) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeImage(imageId);
        return;
      }

      const delta = getArrowKeyDelta(event.key, event.shiftKey);
      if (!delta) return;
      event.preventDefault();
      setSelectedImageId(imageId);
      setImages((currentImages) =>
        currentImages.map((image) =>
          image.id === imageId
            ? {
                ...image,
                ...moveRect(image, {
                  x: image.x + delta.x,
                  y: image.y + delta.y,
                }),
              }
            : image,
        ),
      );
    },
    [removeImage],
  );

  const exportToPNG = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = POSTER_WIDTH;
    canvas.height = POSTER_HEIGHT;
    context.imageSmoothingEnabled = false;

    await renderLayersInOrder(
      images,
      (image) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const imageElement = new Image();
          imageElement.onload = () => resolve(imageElement);
          imageElement.onerror = () => resolve(null);
          imageElement.src = image.src;
        }),
      (imageElement, image) => {
        if (!imageElement) return;
        context.drawImage(
          imageElement,
          image.x,
          image.y,
          image.width,
          image.height,
        );
      },
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pixel-art-poster.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, [images]);

  const selectedImage = images.find((image) => image.id === selectedImageId);
  const layers = [...images].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-neutral-900 text-balance dark:text-white">
            Pixel Art Poster Builder
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Import pixel art images and create crisp, pixelated compositions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1" aria-label="Poster controls">
            <Card className="p-4">
              <h2 className="mb-4 text-lg font-semibold">Tools</h2>

              <div className="mb-6">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2 w-full"
                  variant="outline"
                >
                  <Upload aria-hidden="true" className="mr-2 h-4 w-4" />
                  Import Images
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Choose pixel art images"
                />
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Optimized for pixel art
                </p>
              </div>

              {selectedImage ? (
                <div className="mb-6 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                  <h3 className="mb-2 truncate text-sm font-medium">
                    Selected: {selectedImage.name}
                  </h3>
                  <div className="space-y-3">
                    <p
                      className="text-xs text-neutral-600 tabular-nums dark:text-neutral-400"
                      aria-live="polite"
                    >
                      Position: {selectedImage.x}, {selectedImage.y} · Size:{" "}
                      {selectedImage.width} × {selectedImage.height}px
                    </p>
                    <p
                      id="poster-keyboard-help"
                      className="text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      Arrow keys move by 1px. Hold Shift to move by 10px. Press
                      Delete to remove.
                    </p>
                    <div className="grid grid-cols-4 gap-1" aria-label="Image scale">
                      {[0.5, 1, 2, 4].map((scale) => (
                        <Button
                          key={scale}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => scaleImage(selectedImage.id, scale)}
                          aria-label={`Scale ${selectedImage.name} to ${scale} times its original size`}
                        >
                          {scale}×
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => resetImageSize(selectedImage.id)}
                      className="w-full"
                    >
                      Reset Size
                    </Button>
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => sendToBack(selectedImage.id)}
                      >
                        Send to Back
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => moveDown(selectedImage.id)}
                      >
                        Move Down
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => moveUp(selectedImage.id)}
                      >
                        Move Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => bringToFront(selectedImage.id)}
                      >
                        Bring to Front
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mb-6">
                <Button
                  type="button"
                  onClick={exportToPNG}
                  className="w-full"
                  disabled={images.length === 0}
                >
                  <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                  Export as PNG
                </Button>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Images ({images.length})
                </h3>
                {layers.length > 0 ? (
                  <ul className="max-h-64 space-y-2 overflow-y-auto">
                    {layers.map((image, index) => (
                      <li
                        key={image.id}
                        className={`flex items-center justify-between rounded p-1 text-sm ${
                          selectedImageId === image.id
                            ? "bg-neutral-100 dark:bg-neutral-900"
                            : "bg-neutral-50 dark:bg-neutral-800"
                        }`}
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center rounded p-1 text-left hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-neutral-700"
                          onClick={() => setSelectedImageId(image.id)}
                          aria-pressed={selectedImageId === image.id}
                        >
                          <span className="mr-2 text-xs text-neutral-400 tabular-nums dark:text-neutral-500">
                            #{images.length - index}
                          </span>
                          <span className="truncate">{image.name}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveUp(image.id)}
                            className="h-7 w-7 rounded text-xs text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                            aria-label={`Move ${image.name} up one layer`}
                            title="Move up one layer"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(image.id)}
                            className="h-7 w-7 rounded text-xs text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                            aria-label={`Move ${image.name} down one layer`}
                            title="Move down one layer"
                          >
                            ↓
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeImage(image.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            aria-label={`Remove ${image.name}`}
                            title="Remove image"
                          >
                            <Trash2 aria-hidden="true" className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    No images imported yet.
                  </p>
                )}
              </div>
            </Card>
          </aside>

          <section className="min-w-0 lg:col-span-3" aria-labelledby="poster-canvas-title">
            <Card className="p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 id="poster-canvas-title" className="text-lg font-semibold">
                  Canvas
                </h2>
                <div className="text-sm text-neutral-500 tabular-nums">
                  {POSTER_WIDTH} × {POSTER_HEIGHT}px · Pixel Perfect
                </div>
              </div>

              <div
                ref={canvasRef}
                className="relative aspect-[4/3] w-full max-w-[800px] touch-none overflow-hidden rounded-lg bg-transparent outline-2 -outline-offset-2 outline-dashed outline-neutral-300 select-none"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, ${theme === "dark" ? "#1D1F1F" : "#f0f0f0"} 25%, transparent 25%),
                    linear-gradient(-45deg, ${theme === "dark" ? "#1D1F1F" : "#f0f0f0"} 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, ${theme === "dark" ? "#1D1F1F" : "#f0f0f0"} 75%),
                    linear-gradient(-45deg, transparent 75%, ${theme === "dark" ? "#1D1F1F" : "#f0f0f0"} 75%)
                  `,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedImageId(null);
                  }
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={finishInteraction}
                onPointerCancel={finishInteraction}
              >
                {images.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-400">
                    <div className="text-center">
                      <Upload
                        aria-hidden="true"
                        className="mx-auto mb-2 h-12 w-12 opacity-50"
                      />
                      <p>Import pixel art images to start building.</p>
                    </div>
                  </div>
                ) : null}

                {[...images]
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((image) => {
                    const isSelected = selectedImageId === image.id;
                    return (
                      <div
                        key={image.id}
                        className={`group absolute ${
                          isSelected ? "ring-2 ring-neutral-500" : ""
                        }`}
                        style={{
                          left: `${(image.x / POSTER_WIDTH) * 100}%`,
                          top: `${(image.y / POSTER_HEIGHT) * 100}%`,
                          width: `${(image.width / POSTER_WIDTH) * 100}%`,
                          height: `${(image.height / POSTER_HEIGHT) * 100}%`,
                          zIndex: image.zIndex,
                        }}
                      >
                        <button
                          type="button"
                          className="absolute inset-0 h-full w-full cursor-move touch-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => setSelectedImageId(image.id)}
                          onPointerDown={(event) =>
                            handleDragStart(event, image.id)
                          }
                          onKeyDown={(event) =>
                            handleImageKeyDown(event, image.id)
                          }
                          aria-label={`${image.name}, position ${image.x}, ${image.y}, size ${image.width} by ${image.height} pixels`}
                          aria-describedby={
                            isSelected ? "poster-keyboard-help" : undefined
                          }
                        >
                          <img
                            src={image.src}
                            alt=""
                            className="rendering-pixelated pointer-events-none h-full w-full object-fill"
                            draggable={false}
                          />
                        </button>

                        {isSelected
                          ? RESIZE_HANDLES.map(({ handle, label, position }) => (
                              <span
                                key={handle}
                                className={`absolute z-10 flex h-6 w-6 touch-none items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${position}`}
                                onPointerDown={(event) =>
                                  handleResizeStart(event, image.id, handle)
                                }
                                title={`Resize from ${label}`}
                                aria-hidden="true"
                              >
                                <span className="h-3 w-3 border border-white bg-neutral-600" />
                              </span>
                            ))
                          : null}
                      </div>
                    );
                  })}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
