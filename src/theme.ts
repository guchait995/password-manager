import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Color mode config
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Extend the theme with custom colors, fonts, etc.
const theme = extendTheme({
  config,
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  colors: {
    brand: {
      50: "#e6f6ff",
      100: "#bae3ff",
      200: "#7cc4fa",
      300: "#47a3f3",
      400: "#2186eb",
      500: "#0967d2",
      600: "#0552b5",
      700: "#03449e",
      800: "#01337d",
      900: "#002159",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "medium",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
        },
      },
    },
  },
});

export default theme;
