// src/components/layout/GovHeader.jsx
// Official Government of India style header — three-zone layout
// Zone A: thin top strip (28px) — identity + utility links
// Zone B: main header bar — emblem + app name + accessibility controls
// Zone C: nav tab bar — primary navigation

import { Volume2, VolumeX, Type, Contrast } from "lucide-react";
import useAccessibilityStore from "../../store/accessibilityStore";
import { useTTS } from "../../hooks/useTTS";
import ashokaEmblem from "../../assets/ashoka-emblem.svg";

// Font size cycle order — matches Phase 1 store shape
const FONT_SIZE_CYCLE = ["normal", "large", "xlarge"];

// Nav tabs — bilingual labels
const NAV_TABS = [
  { id: "home",      labelHindi: "होम",           labelEnglish: "Home" },
  { id: "legal",     labelHindi: "कानूनी सहायता", labelEnglish: "Legal Help" },
  { id: "documents", labelHindi: "दस्तावेज़",      labelEnglish: "Documents" },
  { id: "help",      labelHindi: "सहायता",         labelEnglish: "Help" },
];

export default function GovHeader({ activeTab = "home", onTabChange }) {
  const {
    ttsEnabled,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    toggleTTS,
  } = useAccessibilityStore();

  const { speak } = useTTS();

  // Cycle through font sizes: normal → large → xlarge → normal
  function handleFontSizeCycle() {
    const currentIndex = FONT_SIZE_CYCLE.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % FONT_SIZE_CYCLE.length;
    const next = FONT_SIZE_CYCLE[nextIndex];
    setFontSize(next);
    speak(`Font size changed to ${next}`);
  }

  function handleTtsToggle() {
    toggleTTS();
    // We speak the confirmation only if we're turning TTS ON
    if (!ttsEnabled) {
      setTimeout(() => speak("Text to speech enabled"), 100);
    }
  }

  function handleContrastToggle() {
    toggleHighContrast();
    speak(highContrast ? "High contrast off" : "High contrast on");
  }

  function handleScreenReaderAccess() {
    speak(
      "Screen reader mode active. Use Tab to navigate between elements. Press Enter or Space to activate buttons. Press Escape to close dialogs."
    );
  }

  return (
    <header
      className="gov-header"
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        // Total height = 28px strip + ~60px main bar + ~40px nav tabs ≈ 128px
        // CSS variable set on :root via PageShell
      }}
    >
      {/* ── Zone A: Top identity strip ── */}
      <div
        className="gov-header__strip"
        style={{
          height: "28px",
          backgroundColor: "#003580",
          color: "#ffffff",
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          letterSpacing: "0.01em",
        }}
      >
        {/* Left: Official bilingual identity */}
        <span style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
          <span className="devanagari" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            भारत सरकार
          </span>
          <span style={{ margin: "0 6px", opacity: 0.6 }}>|</span>
          Government of India
        </span>

        {/* Right: Utility accessibility links */}
        <nav aria-label="Utility navigation" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a
            href="#main-content"
            style={{
              color: "#ffffff",
              textDecoration: "underline",
              fontSize: "11px",
              opacity: 0.85,
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.opacity = "1")}
            onBlur={(e) => (e.target.style.opacity = "0.85")}
          >
            Skip to main content
          </a>

          <button
            type="button"
            onClick={handleScreenReaderAccess}
            aria-label="Activate screen reader guidance"
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: "11px",
              cursor: "pointer",
              padding: "2px 4px",
              textDecoration: "underline",
              opacity: 0.85,
              fontFamily: "'Noto Sans', sans-serif",
            }}
            onFocus={(e) => {
              e.target.style.opacity = "1";
              e.target.style.outline = "2px solid #ffffff";
              e.target.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.target.style.opacity = "0.85";
              e.target.style.outline = "none";
            }}
          >
            Screen Reader Access
          </button>
        </nav>
      </div>

      {/* ── Zone B: Main header bar ── */}
      <div
        className="gov-header__main"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "2px solid #D0D7E2",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "60px",
        }}
      >
        {/* Left: Emblem + App name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src={ashokaEmblem}
            alt="Ashoka Emblem — Government of India"
            style={{
              height: "52px",
              maxHeight: "52px",
              width: "auto",
              flexShrink: 0,
            }}
          />

          {/* Vertical divider */}
          <div
            aria-hidden="true"
            style={{
              width: "1px",
              height: "44px",
              backgroundColor: "#D0D7E2",
              flexShrink: 0,
            }}
          />

          {/* App name block */}
          <div>
            <div
              className="devanagari"
              style={{
                fontFamily: "'Noto Sans Devanagari', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#003580",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              न्याय सहायक
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans', sans-serif",
                fontSize: "12px",
                color: "#4A5568",
                lineHeight: 1.3,
                marginTop: "2px",
              }}
            >
              Nyaya Sahayak — Legal Aid Assistant
            </div>
          </div>
        </div>

        {/* Right: Accessibility utility controls */}
        <div
          role="toolbar"
          aria-label="Accessibility controls"
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          {/* TTS Toggle */}
          <button
            type="button"
            onClick={handleTtsToggle}
            aria-label={ttsEnabled ? "Turn off text-to-speech" : "Turn on text-to-speech"}
            aria-pressed={ttsEnabled}
            title={ttsEnabled ? "Text-to-speech on" : "Text-to-speech off"}
            style={utilityButtonStyle(ttsEnabled)}
            onFocus={applyFocusStyle}
            onBlur={removeFocusStyle}
            onMouseEnter={applyHoverStyle}
            onMouseLeave={removeHoverStyle}
          >
            {ttsEnabled ? (
              <Volume2 size={18} color="#003580" aria-hidden="true" />
            ) : (
              <VolumeX size={18} color="#718096" aria-hidden="true" />
            )}
          </button>

          {/* Font size cycle */}
          <button
            type="button"
            onClick={handleFontSizeCycle}
            aria-label={`Current font size: ${fontSize}. Click to cycle font size`}
            title="Cycle font size"
            style={utilityButtonStyle(false)}
            onFocus={applyFocusStyle}
            onBlur={removeFocusStyle}
            onMouseEnter={applyHoverStyle}
            onMouseLeave={removeHoverStyle}
          >
            <Type size={18} color="#003580" aria-hidden="true" />
            {/* Small indicator dot for current size */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: fontSize === "normal" ? "4px" : fontSize === "large" ? "6px" : "8px",
                height: fontSize === "normal" ? "4px" : fontSize === "large" ? "6px" : "8px",
                borderRadius: "50%",
                backgroundColor: "#FF6200",
                transition: "width 0.15s, height 0.15s",
              }}
            />
          </button>

          {/* High contrast toggle */}
          <button
            type="button"
            onClick={handleContrastToggle}
            aria-label={highContrast ? "Turn off high contrast" : "Turn on high contrast"}
            aria-pressed={highContrast}
            title={highContrast ? "High contrast on" : "High contrast off"}
            style={utilityButtonStyle(highContrast)}
            onFocus={applyFocusStyle}
            onBlur={removeFocusStyle}
            onMouseEnter={applyHoverStyle}
            onMouseLeave={removeHoverStyle}
          >
            <Contrast size={18} color={highContrast ? "#003580" : "#718096"} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Zone C: Navigation tab bar ── */}
      <nav
        aria-label="Primary navigation"
        style={{
          backgroundColor: "#003580",
          display: "flex",
          alignItems: "stretch",
          paddingLeft: "8px",
          minHeight: "40px",
        }}
        role="tablist"
      >
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.labelEnglish} — ${tab.labelHindi}`}
              onClick={() => onTabChange?.(tab.id)}
              style={{
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#003580" : "#ffffff",
                border: "none",
                borderTop: isActive ? "3px solid #FF6200" : "3px solid transparent",
                padding: "0 20px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minHeight: "40px",
                transition: "background 0.15s, color 0.15s",
                position: "relative",
                outline: "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #ffffff";
                e.currentTarget.style.outlineOffset = "-3px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              {/* Hindi label */}
              <span
                className="devanagari"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                {tab.labelHindi}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

// ── Style helpers for the 36×36 utility buttons ──

function utilityButtonStyle(isActive) {
  return {
    width: "36px",
    height: "36px",
    border: `1px solid ${isActive ? "#003580" : "#D0D7E2"}`,
    borderRadius: "6px",
    background: isActive ? "#E8EEF7" : "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",        // needed for the font-size indicator dot
    transition: "background 0.15s, border-color 0.15s",
    outline: "none",
    flexShrink: 0,
  };
}

function applyFocusStyle(e) {
  e.currentTarget.style.outline = "2px solid #003580";
  e.currentTarget.style.outlineOffset = "2px";
}

function removeFocusStyle(e) {
  e.currentTarget.style.outline = "none";
}

function applyHoverStyle(e) {
  e.currentTarget.style.background = "#F1F4F8";
  e.currentTarget.style.borderColor = "#003580";
}

function removeHoverStyle(e) {
  // Restore based on active state — read aria-pressed
  const isActive = e.currentTarget.getAttribute("aria-pressed") === "true";
  e.currentTarget.style.background = isActive ? "#E8EEF7" : "#ffffff";
  e.currentTarget.style.borderColor = isActive ? "#003580" : "#D0D7E2";
}