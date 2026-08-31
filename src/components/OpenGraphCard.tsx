import type { CSSProperties } from "react";

import {
  getOpenGraphTitleSize,
  type OpenGraphCardDefinition,
  type OpenGraphCardTheme,
} from "@/lib/open-graph";

const ARTICLE_RAIL_WIDTHS = [
  14, 18, 22, 16, 26, 18, 34, 20, 44, 24, 56, 72, 48, 30, 22, 42, 20, 28,
  18, 24,
];

const TOOL_MARKS = [0.2, 0.35, 0.55, 0.3, 0.72, 0.4, 0.28, 0.48, 0.24];

const palettes = {
  dark: {
    accent: "#f4f4f5",
    background: "linear-gradient(180deg, #09090b 0%, #303033 100%)",
    border: "rgba(244, 244, 245, 0.16)",
    muted: "#a1a1aa",
    surface: "rgba(244, 244, 245, 0.07)",
    text: "#f4f4f5",
  },
  light: {
    accent: "#18181b",
    background: "linear-gradient(180deg, #fafafa 0%, #e4e7eb 100%)",
    border: "rgba(24, 24, 27, 0.14)",
    muted: "#64646d",
    surface: "rgba(255, 255, 255, 0.5)",
    text: "#18181b",
  },
} as const;

function formatArticleDate(date: Date, language: string) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function ArticleRail({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        position: "absolute",
        right: 70,
        top: 64,
      }}
    >
      {ARTICLE_RAIL_WIDTHS.map((width, index) => (
        <div
          key={`${width}-${index}`}
          style={{
            backgroundColor: color,
            height: index === 11 ? 4 : 3,
            opacity: index === 11 ? 0.9 : 0.24,
            width,
          }}
        />
      ))}
    </div>
  );
}

function ToolMarks({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 13,
        position: "absolute",
        right: 72,
        top: 72,
        width: 122,
      }}
    >
      {TOOL_MARKS.map((opacity, index) => (
        <div
          key={`${opacity}-${index}`}
          style={{
            backgroundColor: color,
            borderRadius: 5,
            height: 32,
            opacity,
            width: 32,
          }}
        />
      ))}
    </div>
  );
}

export function OpenGraphCard({
  card,
  theme,
}: {
  card: OpenGraphCardDefinition;
  theme: OpenGraphCardTheme;
}) {
  const palette = palettes[theme];
  const titleStyle: CSSProperties = {
    color: palette.text,
    display: "block",
    fontSize: getOpenGraphTitleSize(card.title),
    fontWeight: 700,
    letterSpacing: "-0.045em",
    lineHeight: 1.02,
    margin: 0,
    maxWidth: card.kind === "page" ? 940 : 850,
    textWrap: "balance",
  };

  return (
    <div
      style={{
        backgroundImage: palette.background,
        color: palette.text,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
        height: 630,
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "66px 76px 58px",
        position: "relative",
        width: 1200,
      }}
    >
      <div
        style={{
          backgroundImage:
            theme === "dark"
              ? "radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(255,255,255,0) 66%)"
              : "radial-gradient(circle at center, rgba(255,255,255,0.8), rgba(255,255,255,0) 68%)",
          display: "flex",
          height: 520,
          position: "absolute",
          right: -150,
          top: -180,
          width: 620,
        }}
      />

      {card.kind === "article" ? <ArticleRail color={palette.accent} /> : null}
      {card.kind === "tool" ? <ToolMarks color={palette.accent} /> : null}

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div
          style={{
            color: palette.muted,
            display: "flex",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: 38,
            textTransform: "uppercase",
          }}
        >
          {card.section}
        </div>

        <div style={titleStyle}>{card.title}</div>

        <div
          style={{
            color: palette.muted,
            display: "-webkit-box",
            fontSize: 25,
            lineHeight: 1.4,
            marginTop: 28,
            maxWidth: 760,
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {card.description}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: `1px solid ${palette.border}`,
          color: palette.muted,
          display: "flex",
          fontSize: 17,
          justifyContent: "space-between",
          paddingTop: 24,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontWeight: 700 }}>
          cristianbgp.com
        </div>

        {card.article ? (
          <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
            <span>{formatArticleDate(card.article.date, card.article.language)}</span>
            <span style={{ color: palette.border }}>/</span>
            <span>{card.article.language.toUpperCase()}</span>
            {card.article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 7,
                  color: palette.text,
                  padding: "6px 10px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {card.tool ? (
          <div style={{ color: palette.text, display: "flex" }}>
            {card.tool.label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
