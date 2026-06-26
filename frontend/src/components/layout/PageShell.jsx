// src/components/layout/PageShell.jsx
import { useState, useEffect, useRef } from "react";
import GovHeader from "./GovHeader";
import Sidebar from "./Sidebar";
import GovFooter from "./GovFooter";

const HEADER_HEIGHT = 128;
const SIDEBAR_WIDTH = 260;

export default function PageShell({ children, showSidebar = true }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeTopic, setActiveTopic] = useState("rti");
  const headerRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--header-height", `${HEADER_HEIGHT}px`);
    document.documentElement.style.setProperty("--sidebar-width", `${SIDEBAR_WIDTH}px`);
    return () => {
      document.documentElement.style.removeProperty("--header-height");
      document.documentElement.style.removeProperty("--sidebar-width");
    };
  }, []);

  return (
    <>
      <GovHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          paddingTop: `${HEADER_HEIGHT}px`,
          backgroundColor: "#F1F4F8",
        }}
      >
        {/* Sidebar is now conditionally rendered */}
        {showSidebar && (
          <Sidebar onTopicChange={setActiveTopic} activeTopic={activeTopic} />
        )}

        <div
          style={{
            marginLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : "0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            transition: "margin-left 0.2s ease",
          }}
        >
          <main
            id="main-content"
            tabIndex={-1}
            style={{
              flex: 1,
              padding: "24px",
              outline: "none",
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px - 56px)`,
            }}
          >
            {/* THE FIX: Execute the function if children is a render prop */}
            {typeof children === "function"
              ? children({ activeTab, setActiveTab, activeTopic, setActiveTopic })
              : children}
          </main>
          <GovFooter />
        </div>
      </div>
    </>
  );
}