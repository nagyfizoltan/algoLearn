import React from "react";
import AppRoutes from "./components/routes/Routes";
import { AuthProvider } from "./components/AuthContext"; 
import theme from "./theme"; // Custom theme file
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LanguageProvider } from "./components/LanguageContext";

function App() {
  return (    
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize styles */}
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
