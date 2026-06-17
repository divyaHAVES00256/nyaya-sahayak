// src/components/layout/PageShell.jsx
// Assembles the full page layout:
//   GovHeader  (fixed, top, full width)
//   Sidebar    (fixed, left, below header)
//   Main       (scrollable, offset from header + sidebar)
//   GovFooter  (in flow, below main content)
//
// Sets --header-height CSS variable on :root so Sidebar and any other
// position-dependent children can consume it without prop-drilling.

import { useState, useEffect, useRef } from "react";
import GovHeader from "./GovHeader";
import Sidebar from "./Sidebar";
import GovFooter from "./GovFooter";

// Header zones:
//   Zone A (strip):    28px
//   Zone B (main bar): ~60px  (py-3 = 12px top + 12px bottom + 52px emblem)
//   Zone C (nav tabs): 40px
// Total: 128px — set as CSS variable and JS constant together so they never drift.
const HEADER_HEIGHT = 128;
const SIDEBAR_WIDTH = 260;

export default function PageShell({ children }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeTopic, setActiveTopic] = useState("rti");
  const headerRef = useRef(null);

  // Inject --header-height on :root so Sidebar, sticky elements, etc. can use it
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${HEADER_HEIGHT}px`
    );
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${SIDEBAR_WIDTH}px`
    );

    return () => {
      // Clean up on unmount (safe for multi-shell scenarios in future phases)
      document.documentElement.style.removeProperty("--header-height");
      document.documentElement.style.removeProperty("--sidebar-width");
    };
  }, []);

  return (
    <>
      {/* ── Fixed header — always on top ── */}
      <GovHeader
        ref={headerRef}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── Page body — sits below fixed header ── */}
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          paddingTop: `${HEADER_HEIGHT}px`, // push content below fixed header
          backgroundColor: "#F1F4F8",
        }}
      >
        {/* ── Fixed sidebar ── */}
        <Sidebar onTopicChange={setActiveTopic} />

        {/* ── Scrollable content column ── */}
        <div
          style={{
            marginLeft: `${SIDEBAR_WIDTH}px`,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0, // prevent flex child overflow
          }}
        >
          {/* Main content area — children rendered here */}
          <main
            id="main-content"
            tabIndex={-1} // programmatically focusable for skip link
            style={{
              flex: 1,
              padding: "24px",
              outline: "none", // suppress focus ring on the region itself
              // min-height ensures footer always pushed to bottom even on sparse pages
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px - 56px)`, // 56px = footer height
            }}
          >
            {children}
          </main>

          {/* ── Footer — in normal flow below main ── */}
          <GovFooter />
        </div>
      </div>
    </>
  );
}