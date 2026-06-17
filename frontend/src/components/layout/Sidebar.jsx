// src/components/layout/Sidebar.jsx
// Left navigation sidebar — legal topic list, helpline card, version tag
// activeTopic state lives here in Phase 2; Phase 3 will lift it to shared store

import { useState } from "react";
import {
  FileText,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
  Phone,
} from "lucide-react";
import { LEGAL_TOPICS } from "../../constants/legalTopics";
import { useTTS } from "../../hooks/useTTS";

// Map icon name strings (from legalTopics.js) to lucide components
const ICON_MAP = {
  FileText,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
};

// Sidebar sits below the fixed header; header height CSS variable is set in PageShell
const SIDEBAR_WIDTH = 260;

export default function Sidebar({ onTopicChange }) {
  const [activeTopic, setActiveTopic] = useState("rti");
  const { speak } = useTTS();

  function handleTopicSelect(topic) {
    setActiveTopic(topic.id);
    onTopicChange?.(topic.id);
    speak(`${topic.labelEnglish} selected. ${topic.act}`);
  }

  function handleHelplineClick() {
    speak(
      "National Legal Services helpline number is 1516. This is a toll free number available 24 hours."
    );
  }

  return (
    <aside
      aria-label="Legal topics navigation"
      style={{
        position: "fixed",
        top: "var(--header-height, 128px)",
        left: 0,
        width: `${SIDEBAR_WIDTH}px`,
        height: "calc(100vh - var(--header-height, 128px))",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #D0D7E2",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* ── Section label ── */}
      <div
        style={{
          padding: "16px 16px 8px 16px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#718096",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "'Noto Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        <span className="devanagari" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
          कानूनी विषय
        </span>
        {" "}
        <span aria-hidden="true" style={{ opacity: 0.5 }}>/</span>
        {" "}
        Legal Topics
      </div>

      {/* ── Topic list ── */}
      <nav
        role="menu"
        aria-label="Legal topics"
        style={{ flex: 1 }}
      >
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {LEGAL_TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            const IconComponent = ICON_MAP[topic.icon];

            return (
              <li key={topic.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-label={`${topic.labelEnglish} — ${topic.act}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => handleTopicSelect(topic)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    background: isActive ? "#FFF5EF" : "transparent",
                    border: "none",
                    borderLeft: isActive
                      ? "3px solid #FF6200"
                      : "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s, border-color 0.15s",
                    outline: "none",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#F1F4F8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid #003580";
                    e.currentTarget.style.outlineOffset = "-2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  {/* Icon */}
                  {IconComponent && (
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "20px",
                        height: "20px",
                        color: isActive ? topic.color : "#718096",
                        transition: "color 0.15s",
                      }}
                    >
                      <IconComponent size={20} />
                    </span>
                  )}

                  {/* Labels */}
                  <span style={{ minWidth: 0, flex: 1 }}>
                    {/* Hindi label */}
                    <span
                      className="devanagari"
                      style={{
                        display: "block",
                        fontFamily: "'Noto Sans Devanagari', sans-serif",
                        fontSize: "14px",
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#003580" : "#0D0D0D",
                        lineHeight: 1.3,
                        transition: "color 0.15s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {topic.labelHindi}
                    </span>
                    {/* English label */}
                    <span
                      style={{
                        display: "block",
                        fontFamily: "'Noto Sans', sans-serif",
                        fontSize: "11px",
                        color: "#718096",
                        lineHeight: 1.3,
                        marginTop: "1px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {topic.labelEnglish}
                    </span>
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#FF6200",
                      }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Divider ── */}
      <hr
        aria-hidden="true"
        style={{
          border: "none",
          borderTop: "1px solid #D0D7E2",
          margin: "4px 0",
          flexShrink: 0,
        }}
      />

      {/* ── Helpline card ── */}
      <div style={{ padding: "12px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleHelplineClick}
          aria-label="National Legal Services helpline 1516 — toll free, 24 hours. Click to hear details."
          style={{
            width: "100%",
            backgroundColor: "#003580",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "12px",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            outline: "none",
            transition: "background 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #FF6200";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#002460";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#003580";
          }}
        >
          {/* Top row: icon + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <Phone size={16} aria-hidden="true" color="#ffffff" style={{ flexShrink: 0 }} />
            <span
              className="devanagari"
              style={{
                fontFamily: "'Noto Sans Devanagari', sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.3,
              }}
            >
              राष्ट्रीय विधिक सेवा
            </span>
          </div>

          {/* Helpline number */}
          <div
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.04em",
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            1516
          </div>

          {/* Sub-label */}
          <div
            style={{
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.02em",
            }}
          >
            Toll Free • 24x7
          </div>
        </button>
      </div>

      {/* ── Version tag ── */}
      <div
        style={{
          padding: "8px",
          textAlign: "center",
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: "10px",
          color: "#718096",
          flexShrink: 0,
          letterSpacing: "0.03em",
        }}
        aria-hidden="true"
      >
        v1.0 Beta • NIC
      </div>
    </aside>
  );
}