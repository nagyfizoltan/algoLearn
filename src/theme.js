import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    text: {
      primary: "#02141d",
      secondary: "#f1fbfe"
    },
    background: {
      default: "#f1fbfe", // For main background
    },
    primary: {
      main: "#075a7d", // Primary color
    },
    secondary: {
      main: "#c36af6", // Secondary color
    },
    accent: {
      main: "#de0dcc", // Accent color (custom)
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif", // Optional: Set a global font
    body1: {
      color: "#02141d", // Default text color
    },
  },
});

export default theme;
