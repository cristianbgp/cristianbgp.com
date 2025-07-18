import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Upload, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  name: string;
  zIndex: number;
}

interface DragState {
  isDragging: boolean;
  dragId: string | null;
  offset: { x: number; y: number };
}

interface ResizeState {
  isResizing: boolean;
  resizeId: string | null;
  startPos: { x: number; y: number };
  startSize: { width: number; height: number };
  startImagePos: { x: number; y: number };
  handle: string | null;
}

export default function PixelArtPosterBuilder() {
  const { theme } = useTheme();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragId: null,
    offset: { x: 0, y: 0 },
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizeId: null,
    startPos: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    startImagePos: { x: 0, y: 0 },
    handle: null,
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              // For pixel art, keep original dimensions or scale by integer multiples
              const maxWidth = 400;
              const maxHeight = 400;
              let { width, height } = img;

              // Scale down only if necessary, preferring integer scales
              if (width > maxWidth || height > maxHeight) {
                const scaleX = Math.floor(maxWidth / width) || 1;
                const scaleY = Math.floor(maxHeight / height) || 1;
                const scale = Math.min(scaleX, scaleY);

                if (scale >= 1) {
                  width *= scale;
                  height *= scale;
                } else {
                  // If we need to scale down, do it proportionally
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width = Math.floor(width * ratio);
                  height = Math.floor(height * ratio);
                }
              }

              const newImage: ImageItem = {
                id:
                  Date.now().toString() +
                  Math.random().toString(36).substr(2, 9),
                src: e.target?.result as string,
                x: Math.random() * 200,
                y: Math.random() * 200,
                width,
                height,
                originalWidth: img.width,
                originalHeight: img.height,
                name: file.name,
                zIndex: 0,
              };
              setImages((prev) => [
                ...prev,
                { ...newImage, zIndex: prev.length + 1 },
              ]);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images.length],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, imageId: string) => {
      e.preventDefault();
      e.stopPropagation();

      setSelectedImageId(imageId);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const image = images.find((img) => img.id === imageId);
      if (!image) return;

      setDragState({
        isDragging: true,
        dragId: imageId,
        offset: {
          x: e.clientX - rect.left - image.x,
          y: e.clientY - rect.top - image.y,
        },
      });
    },
    [images],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, imageId: string, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const image = images.find((img) => img.id === imageId);
      if (!image) return;

      setResizeState({
        isResizing: true,
        resizeId: imageId,
        startPos: { x: e.clientX, y: e.clientY },
        startSize: { width: image.width, height: image.height },
        startImagePos: { x: image.x, y: image.y },
        handle,
      });
    },
    [images],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (resizeState.isResizing && resizeState.resizeId) {
        const deltaX = e.clientX - resizeState.startPos.x;
        const deltaY = e.clientY - resizeState.startPos.y;

        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== resizeState.resizeId) return img;

            let newWidth = resizeState.startSize.width;
            let newHeight = resizeState.startSize.height;
            let newX = resizeState.startImagePos.x;
            let newY = resizeState.startImagePos.y;

            // Calculate new dimensions based on handle
            switch (resizeState.handle) {
              case "se": // bottom-right
                newWidth = Math.max(20, resizeState.startSize.width + deltaX);
                newHeight = Math.max(20, resizeState.startSize.height + deltaY);
                break;
              case "sw": // bottom-left
                newWidth = Math.max(20, resizeState.startSize.width - deltaX);
                newHeight = Math.max(20, resizeState.startSize.height + deltaY);
                newX = resizeState.startImagePos.x + deltaX;
                if (newWidth === 20)
                  newX =
                    resizeState.startImagePos.x +
                    resizeState.startSize.width -
                    20;
                break;
              case "ne": // top-right
                newWidth = Math.max(20, resizeState.startSize.width + deltaX);
                newHeight = Math.max(20, resizeState.startSize.height - deltaY);
                newY = resizeState.startImagePos.y + deltaY;
                if (newHeight === 20)
                  newY =
                    resizeState.startImagePos.y +
                    resizeState.startSize.height -
                    20;
                break;
              case "nw": // top-left
                newWidth = Math.max(20, resizeState.startSize.width - deltaX);
                newHeight = Math.max(20, resizeState.startSize.height - deltaY);
                newX = resizeState.startImagePos.x + deltaX;
                newY = resizeState.startImagePos.y + deltaY;
                if (newWidth === 20)
                  newX =
                    resizeState.startImagePos.x +
                    resizeState.startSize.width -
                    20;
                if (newHeight === 20)
                  newY =
                    resizeState.startImagePos.y +
                    resizeState.startSize.height -
                    20;
                break;
            }

            // For pixel art, round to integer pixels
            newWidth = Math.round(newWidth);
            newHeight = Math.round(newHeight);
            newX = Math.round(newX);
            newY = Math.round(newY);

            // Keep within canvas bounds
            newX = Math.max(0, Math.min(newX, rect.width - newWidth));
            newY = Math.max(0, Math.min(newY, rect.height - newHeight));

            return {
              ...img,
              width: newWidth,
              height: newHeight,
              x: newX,
              y: newY,
            };
          }),
        );
      } else if (dragState.isDragging && dragState.dragId) {
        const newX = e.clientX - rect.left - dragState.offset.x;
        const newY = e.clientY - rect.top - dragState.offset.y;

        setImages((prev) =>
          prev.map((img) =>
            img.id === dragState.dragId
              ? {
                  ...img,
                  x: Math.round(
                    Math.max(0, Math.min(newX, rect.width - img.width)),
                  ),
                  y: Math.round(
                    Math.max(0, Math.min(newY, rect.height - img.height)),
                  ),
                }
              : img,
          ),
        );
      }
    },
    [dragState, resizeState],
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragId: null,
      offset: { x: 0, y: 0 },
    });
    setResizeState({
      isResizing: false,
      resizeId: null,
      startPos: { x: 0, y: 0 },
      startSize: { width: 0, height: 0 },
      startImagePos: { x: 0, y: 0 },
      handle: null,
    });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedImageId(null);
    }
  }, []);

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      if (selectedImageId === imageId) {
        setSelectedImageId(null);
      }
    },
    [selectedImageId],
  );

  const resetImageSize = useCallback((imageId: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              width: img.originalWidth,
              height: img.originalHeight,
            }
          : img,
      ),
    );
  }, []);

  const scaleImage = useCallback((imageId: string, scale: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              width: Math.round(img.originalWidth * scale),
              height: Math.round(img.originalHeight * scale),
            }
          : img,
      ),
    );
  }, []);

  const bringToFront = useCallback((imageId: string) => {
    setImages((prev) => {
      const maxZ = Math.max(...prev.map((img) => img.zIndex));
      return prev.map((img) =>
        img.id === imageId ? { ...img, zIndex: maxZ + 1 } : img,
      );
    });
  }, []);

  const sendToBack = useCallback((imageId: string) => {
    setImages((prev) => {
      return prev.map((img) =>
        img.id === imageId ? { ...img, zIndex: 0 } : img,
      );
    });
  }, []);

  const moveUp = useCallback((imageId: string) => {
    setImages((prev) => {
      const currentImage = prev.find((img) => img.id === imageId);
      if (!currentImage) return prev;

      const higherImages = prev.filter(
        (img) => img.zIndex > currentImage.zIndex,
      );
      if (higherImages.length === 0) return prev;

      const nextHigher = higherImages.reduce((min, img) =>
        img.zIndex < min.zIndex ? img : min,
      );

      return prev.map((img) => {
        if (img.id === imageId) return { ...img, zIndex: nextHigher.zIndex };
        if (img.id === nextHigher.id)
          return { ...img, zIndex: currentImage.zIndex };
        return img;
      });
    });
  }, []);

  const moveDown = useCallback((imageId: string) => {
    setImages((prev) => {
      const currentImage = prev.find((img) => img.id === imageId);
      if (!currentImage) return prev;

      const lowerImages = prev.filter(
        (img) => img.zIndex < currentImage.zIndex,
      );
      if (lowerImages.length === 0) return prev;

      const nextLower = lowerImages.reduce((max, img) =>
        img.zIndex > max.zIndex ? img : max,
      );

      return prev.map((img) => {
        if (img.id === imageId) return { ...img, zIndex: nextLower.zIndex };
        if (img.id === nextLower.id)
          return { ...img, zIndex: currentImage.zIndex };
        return img;
      });
    });
  }, []);

  const exportToPNG = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

    const promises = sortedImages.map((image) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, image.x, image.y, image.width, image.height);
          resolve();
        };
        img.style.imageRendering = "pixelated";
        img.src = image.src;
      });
    });

    Promise.all(promises).then(() => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "pixel-art-poster.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    });
  }, [images]);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Pixel Art Poster Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import pixel art images and create crisp, pixelated compositions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="mb-4 text-lg font-semibold">Tools</h2>

              {/* Upload Section */}
              <div className="mb-6">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2 w-full"
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Images
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optimized for pixel art
                </p>
              </div>

              {/* Selected Image Controls */}
              {selectedImage && (
                <div className="mb-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-900">
                  <h3 className="mb-2 text-sm font-medium">
                    Selected: {selectedImage.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Size: {selectedImage.width} × {selectedImage.height}px
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scaleImage(selectedImage.id, 0.5)}
                      >
                        0.5×
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scaleImage(selectedImage.id, 1)}
                      >
                        1×
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scaleImage(selectedImage.id, 2)}
                      >
                        2×
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scaleImage(selectedImage.id, 4)}
                      >
                        4×
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetImageSize(selectedImage.id)}
                      className="w-full"
                    >
                      Reset Size
                    </Button>
                  </div>
                </div>
              )}

              {/* Export Section */}
              <div className="mb-6">
                <Button
                  onClick={exportToPNG}
                  className="w-full"
                  disabled={images.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as PNG
                </Button>
              </div>

              {/* Images List */}
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Images ({images.length})
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {[...images]
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map((image, index) => (
                      <div
                        key={image.id}
                        className={`flex cursor-pointer items-center justify-between rounded p-2 text-sm ${
                          selectedImageId === image.id
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setSelectedImageId(image.id)}
                      >
                        <div className="flex min-w-0 flex-1 items-center">
                          <span className="mr-2 text-xs text-gray-400 dark:text-gray-600">
                            #{images.length - index}
                          </span>
                          <span className="truncate">{image.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveUp(image.id);
                            }}
                            className="h-6 w-6 text-xs text-gray-500 hover:text-gray-700"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveDown(image.id);
                            }}
                            className="h-6 w-6 text-xs text-gray-500 hover:text-gray-700"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Canvas</h2>
                <div className="text-sm text-gray-500">
                  800 × 600px • Pixel Perfect
                </div>
              </div>

              <div
                ref={canvasRef}
                className="relative h-[600px] w-full cursor-crosshair overflow-hidden rounded-lg border-2 border-dashed lg:w-[800px] border-gray-300 bg-transparent"
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
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
              >
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-12 w-12 opacity-50" />
                      <p>Import pixel art images to start building</p>
                    </div>
                  </div>
                )}

                {[...images]
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((image) => (
                    <TooltipProvider key={image.id}>
                      <Tooltip
                        delayDuration={100}
                        open={selectedImageId === image.id && !dragState.isDragging}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className={`group absolute select-none ${
                              selectedImageId === image.id
                                ? "ring-2 ring-blue-400"
                                : ""
                            }`}
                            style={{
                              left: image.x,
                              top: image.y,
                              width: image.width,
                              height: image.height,
                              zIndex:
                                dragState.dragId === image.id ||
                                resizeState.resizeId === image.id
                                  ? 9999
                                  : image.zIndex,
                            }}
                          >
                            <img
                              src={image.src || "/placeholder.svg"}
                              alt={image.name}
                              className="rendering-pixelated h-full w-full cursor-move object-cover"
                              draggable={false}
                              onMouseDown={(e) => handleMouseDown(e, image.id)}
                            />

                            {/* Resize Handles */}
                            {selectedImageId === image.id && (
                              <>
                                {/* Corner handles */}
                                <div
                                  className="absolute -top-1 -left-1 h-3 w-3 cursor-nw-resize border border-white bg-blue-500"
                                  onMouseDown={(e) =>
                                    handleResizeStart(e, image.id, "nw")
                                  }
                                />
                                <div
                                  className="absolute -top-1 -right-1 h-3 w-3 cursor-ne-resize border border-white bg-blue-500"
                                  onMouseDown={(e) =>
                                    handleResizeStart(e, image.id, "ne")
                                  }
                                />
                                <div
                                  className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize border border-white bg-blue-500"
                                  onMouseDown={(e) =>
                                    handleResizeStart(e, image.id, "sw")
                                  }
                                />
                                <div
                                  className="absolute -right-1 -bottom-1 h-3 w-3 cursor-se-resize border border-white bg-blue-500"
                                  onMouseDown={(e) =>
                                    handleResizeStart(e, image.id, "se")
                                  }
                                />
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          className="bg-transparent p-0 text-black [--primary:theme(colors.black)]"
                          alignOffset={0}
                        >
                          {/* Layer Controls */}
                          {/* {selectedImageId === image.id && ( */}
                          <div className="flex rounded border bg-white shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                bringToFront(image.id);
                              }}
                              className="border-r px-2 py-1 text-xs hover:bg-gray-100"
                              title="Bring to front"
                            >
                              ↑↑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveUp(image.id);
                              }}
                              className="border-r px-2 py-1 text-xs hover:bg-gray-100"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDown(image.id);
                              }}
                              className="border-r px-2 py-1 text-xs hover:bg-gray-100"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sendToBack(image.id);
                              }}
                              className="px-2 py-1 text-xs hover:bg-gray-100"
                              title="Send to back"
                            >
                              ↓↓
                            </button>
                          </div>
                          {/* )} */}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
