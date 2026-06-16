import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useAccessibilityStore from "./store/accessibilityStore";
import SkipToContent from "./components/accessibility/SkipToContent";
import AccessibilityToolbar from "./components/accessibility/AccessibilityToolbar";
import Home from "./pages/Home";

const fontSizeClassMap = {
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
};

export default function App() {
  const { fontSize, highContrast } = useAccessibilityStore();

  useEffect(() => {
    const body = document.body;
    // Remove all font size classes first
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
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}