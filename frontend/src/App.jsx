// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useAccessibilityStore from "./store/accessibilityStore";
import SkipToContent from "./components/accessibility/SkipToContent";
import AccessibilityToolbar from "./components/accessibility/AccessibilityToolbar";
import Dashboard from "./pages/Dashboard"; // This will point to the new Dashboard/index.jsx folder

const fontSizeClassMap = {
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
};

export default function App() {
  const { fontSize, highContrast } = useAccessibilityStore();

  useEffect(() => {
    const body = document.body;
    body.classList.remove("text-base", "text-lg", "text-xl");
    body.classList.add(fontSizeClassMap[fontSize] || "text-base");
  }, [fontSize]);

  useEffect(() => {
    const body = document.body;
    if (highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  return (
    <BrowserRouter>
      <SkipToContent />
      <AccessibilityToolbar />
      {/* 🚨 REMOVED the <main> tag here. PageShell handles it now! 🚨 */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}