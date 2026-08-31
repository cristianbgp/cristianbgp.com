import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import satori from "satori";
import sharp from "sharp";

import { OpenGraphCard } from "@/components/OpenGraphCard";
import type {
  OpenGraphCardDefinition,
  OpenGraphCardTheme,
} from "@/lib/open-graph";

const WIDTH = 1200;
const HEIGHT = 630;

const regularFontData = readFile(
  resolve(process.cwd(), "src/assets/fonts/Inter-Regular.ttf"),
);
const boldFontData = readFile(
  resolve(process.cwd(), "src/assets/fonts/Inter-Bold.ttf"),
);

export async function renderOpenGraphPng(
  card: OpenGraphCardDefinition,
  theme: OpenGraphCardTheme,
) {
  const [interRegular, interBold] = await Promise.all([
    regularFontData,
    boldFontData,
  ]);
  const svg = await satori(<OpenGraphCard card={card} theme={theme} />, {
    fonts: [
      { data: interRegular, name: "Inter", style: "normal", weight: 400 },
      { data: interBold, name: "Inter", style: "normal", weight: 700 },
    ],
    height: HEIGHT,
    width: WIDTH,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const metadata = await sharp(png).metadata();

  if (
    metadata.format !== "png" ||
    metadata.width !== WIDTH ||
    metadata.height !== HEIGHT
  ) {
    throw new Error(
      `Invalid Open Graph image: expected ${WIDTH}x${HEIGHT} PNG, received ${metadata.width}x${metadata.height} ${metadata.format}`,
    );
  }

  return png;
}
