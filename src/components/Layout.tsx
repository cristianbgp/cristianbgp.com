import type { ReactNode } from "react";

import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";
import { AppCommand } from "@/components/AppCommand";
import { useTheme } from "@/components/theme-provider";
import { isMobile } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <div>
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
      {children}
      <AppCommand />
    </div>
  );
}
