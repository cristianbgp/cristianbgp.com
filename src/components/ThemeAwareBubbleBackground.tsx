import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";
import { isMobile } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";

export function ThemeAwareBubbleBackground() {
  const { theme } = useTheme();

  return (
    <BubbleBackground
      blur={theme === "dark" ? 0 : 40}
      interactive={!isMobile()}
      colors={
        theme === "dark"
          ? {
              first: "16,16,16",
              second: "27,27,27",
              third: "38,38,38",
              fourth: "49,49,49",
              fifth: "60,60,60",
              sixth: "71,71,71",
            }
          : {
              first: "255,255,255",
              second: "240,240,240",
              third: "225,225,225",
              fourth: "210,210,210",
              fifth: "195,195,195",
              sixth: "255,255,255",
            }
      }
      className="fixed inset-0 rounded-none flex items-center from-gray-400 to-gray-200 dark:from-[#313131] dark:to-[#111111] justify-center"
    />
  );
} 