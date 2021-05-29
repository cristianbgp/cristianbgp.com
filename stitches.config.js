import { createCss } from "@stitches/react";

export const {
  styled,
  css,
  global,
  keyframes,
  getCssString,
  theme,
} = createCss({
  theme: {
    fonts: {
      system: "system-ui",
    },
    colors: {
      hiContrast: "hsl(206,10%,5%)",
      loContrast: "white",
    },
    fontSizes: {
      1: "13px",
      2: "15px",
      3: "17px",
    },
  },
  utils: {
    m: (_config) => (value) => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: (_config) => (value) => ({
      marginTop: value,
    }),
    mr: (_config) => (value) => ({
      marginRight: value,
    }),
    mb: (_config) => (value) => ({
      marginBottom: value,
    }),
    ml: (_config) => (value) => ({
      marginLeft: value,
    }),
    mx: (_config) => (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (_config) => (value) => ({
      marginTop: value,
      marginBottom: value,
    }),
    size: (_config) => (value) => ({
      width: value,
      height: value,
    }),
    linearGradient: (_config) => (value) => ({
      backgroundImage: `linear-gradient(${value})`,
    }),
    br: (_config) => (value) => ({
      borderRadius: value,
    }),
  },
  media: {
    xs: "(min-width: 380px)",
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xl: "(min-width: 1280px)",
  },
});
