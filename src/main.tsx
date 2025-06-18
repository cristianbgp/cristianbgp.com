import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home.tsx";
import Resume from "./pages/Resume.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <RoutesApp />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

function RoutesApp() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="resume" element={<Resume />} />
    </Routes>
  );
}
