import { useState, useEffect } from "react";
import GovHeader from "./GovHeader";
import Sidebar from "./Sidebar";
import GovFooter from "./GovFooter";
import useAccessibilityStore from "../../store/accessibilityStore";

export default function PageShell({ children, showSidebar = true, activeTab, onTabChange }) {
  const [activeTopic, setActiveTopic] = useState("rti");
  const darkMode = useAccessibilityStore((s) => s.darkMode);

  // Apply / remove data-theme on the html element whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [darkMode]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-page)",
        color: "var(--text-primary)",
        transition: "background-color 0.25s ease, color 0.25s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <GovHeader activeTab={activeTab ?? "home"} onTabChange={onTabChange} />

      <div className="flex" style={{ paddingTop: "120px", flex: 1, minHeight: 0 }}>
        {showSidebar && (
          <Sidebar activeTopic={activeTopic} onTopicChange={setActiveTopic} />
        )}

        <div
          className="flex-1 flex flex-col"
          style={{ marginLeft: showSidebar ? "260px" : 0, minHeight: 0, flex: 1 }}
        >
          <main id="main-content" className="flex-1 p-6" tabIndex={-1} style={{ flex: 1 }}>
            {typeof children === "function"
              ? children({ activeTopic, setActiveTopic })
              : children}
          </main>
          <GovFooter />
        </div>
      </div>
    </div>
  );
}