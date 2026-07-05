// src/components/layout/GovHeader.jsx
import { Volume2, VolumeX, Type, Sun, Moon } from "lucide-react";
import useAccessibilityStore from "../../store/accessibilityStore";
import { useTTS } from "../../hooks/useTTS";
import ashokaEmblem from "../../assets/ashoka-emblem.svg";

const FONT_SIZE_CYCLE = ["normal", "large", "xlarge"];

const NAV_TABS = [
  { id: "home",      labelHindi: "होम",           labelEnglish: "Home"      },
  { id: "legal",     labelHindi: "कानूनी सहायता", labelEnglish: "Legal Help" },
  { id: "documents", labelHindi: "दस्तावेज़",      labelEnglish: "Documents"  },
  { id: "help",      labelHindi: "सहायता",         labelEnglish: "Help"       },
];

export default function GovHeader({ activeTab = "home", onTabChange }) {
  const {
    ttsEnabled,
    fontSize,
    setFontSize,
    toggleTTS,
    darkMode,
    toggleDarkMode,
  } = useAccessibilityStore();

  const { speak } = useTTS();

  function handleFontSizeCycle() {
    const next = FONT_SIZE_CYCLE[(FONT_SIZE_CYCLE.indexOf(fontSize) + 1) % FONT_SIZE_CYCLE.length];
    setFontSize(next);
    speak(`Font size changed to ${next}`);
  }

  function handleTtsToggle() {
    toggleTTS();
    if (!ttsEnabled) setTimeout(() => speak("Text to speech enabled"), 100);
  }

  function handleDarkModeToggle() {
    toggleDarkMode();
    speak(darkMode ? "Light mode enabled" : "Dark mode enabled");
  }

  function handleScreenReaderAccess() {
    speak(
      "Screen reader mode active. Use Tab to navigate between elements. " +
      "Press Enter or Space to activate buttons. Press Escape to close dialogs."
    );
  }

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* ── Zone B: Main header bar ───────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "2px solid var(--border)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "60px",
          transition: "background-color 0.25s ease",
        }}
      >
        {/* Left: Emblem + App name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src={ashokaEmblem}
            alt="Ashoka Emblem — Government of India"
            style={{ height: "52px", maxHeight: "52px", width: "auto", flexShrink: 0 }}
          />
          <div
            aria-hidden="true"
            style={{ width: "1px", height: "44px", backgroundColor: "var(--border)", flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Noto Sans Devanagari', sans-serif",
                fontSize: "20px", fontWeight: 700,
                color: "var(--navy)",
                lineHeight: 1.2, letterSpacing: "-0.01em",
              }}
            >
              न्याय सहायक
            </div>
            <div
              style={{
                fontFamily: "'Noto Sans', sans-serif",
                fontSize: "12px", color: "var(--text-secondary)",
                lineHeight: 1.3, marginTop: "2px",
              }}
            >
              Nyaya Sahayak — Legal Aid Assistant
            </div>
          </div>
        </div>

        {/* Right: Accessibility controls */}
        <div
          role="toolbar"
          aria-label="Accessibility controls"
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          {/* TTS toggle */}
          <button
            type="button"
            onClick={handleTtsToggle}
            aria-label={ttsEnabled ? "Turn off text-to-speech" : "Turn on text-to-speech"}
            aria-pressed={ttsEnabled}
            title={ttsEnabled ? "Text-to-speech on" : "Text-to-speech off"}
            style={utilBtnStyle(ttsEnabled)}
            onMouseEnter={applyHover}
            onMouseLeave={(e) => removeHover(e, ttsEnabled)}
            onFocus={applyFocus}
            onBlur={removeFocus}
          >
            {ttsEnabled
              ? <Volume2 size={18} style={{ color: "var(--navy)" }} aria-hidden="true" />
              : <VolumeX  size={18} style={{ color: "var(--text-muted)" }} aria-hidden="true" />}
          </button>

          {/* Font size cycle */}
          <button
            type="button"
            onClick={handleFontSizeCycle}
            aria-label={`Current font size: ${fontSize}. Click to cycle`}
            title="Cycle font size"
            style={{ ...utilBtnStyle(false), position: "relative" }}
            onMouseEnter={applyHover}
            onMouseLeave={(e) => removeHover(e, false)}
            onFocus={applyFocus}
            onBlur={removeFocus}
          >
            <Type size={18} style={{ color: "var(--navy)" }} aria-hidden="true" />
            <span
              aria-hidden="true"
              style={{
                position: "absolute", bottom: "4px", right: "4px",
                width:  fontSize === "normal" ? "4px" : fontSize === "large" ? "6px" : "8px",
                height: fontSize === "normal" ? "4px" : fontSize === "large" ? "6px" : "8px",
                borderRadius: "50%",
                backgroundColor: "var(--saffron)",
                transition: "width 0.15s, height 0.15s",
              }}
            />
          </button>

          {/* ── Dark / Light mode toggle ── */}
          <button
            type="button"
            onClick={handleDarkModeToggle}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            title={darkMode ? "Light mode" : "Dark mode"}
            style={utilBtnStyle(darkMode)}
            onMouseEnter={applyHover}
            onMouseLeave={(e) => removeHover(e, darkMode)}
            onFocus={applyFocus}
            onBlur={removeFocus}
          >
            {darkMode
              ? <Sun  size={18} style={{ color: "var(--saffron)" }} aria-hidden="true" />
              : <Moon size={18} style={{ color: "var(--text-muted)" }} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* ── Zone C: Primary navigation stripe ────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--navy-dark)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
          borderTop: "4px solid var(--saffron)",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            padding: "0 18px",
            minHeight: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
                  style={navBtnStyle(isActive)}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  onFocus={(e) => { e.currentTarget.style.outline = "2px solid #ffffff"; e.currentTarget.style.outlineOffset = "-3px"; }}
                  onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
                >
                  <span style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: "14px", fontWeight: 600 }}>
                  {tab.labelEnglish}
                </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#ffffff", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.82 }}>
              National Legal Aid Portal
            </span>
            <span
              aria-hidden="true"
              style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff", opacity: 0.48 }}
            />
            <span style={{ color: "#ffffff", fontSize: "12px", opacity: 0.82 }}>
              गृह/होम · कानूनी सहायता · दस्तावेज़ · सहायता
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Style helpers ────────────────────────────────────────────────────────── */
function navBtnStyle(isActive) {
  return {
    background: "transparent",
    color: "#ffffff",
    border: "none",
    borderBottom: isActive ? "3px solid var(--saffron)" : "3px solid transparent",
    borderRadius: "0",
    padding: "10px 18px",
    minHeight: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease, border-bottom-color 0.2s ease",
    outline: "none",
    whiteSpace: "nowrap",
  };
}

function utilBtnStyle(isActive) {
  return {
    width:           "36px",
    height:          "36px",
    border:          `1px solid ${isActive ? "var(--navy)" : "var(--border)"}`,
    borderRadius:    "6px",
    background:      isActive ? "var(--navy-light)" : "var(--bg-surface)",
    cursor:          "pointer",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    position:        "relative",
    transition:      "background 0.15s, border-color 0.15s",
    outline:         "none",
    flexShrink:      0,
  };
}

function applyHover(e) {
  e.currentTarget.style.background    = "var(--bg-surface-2)";
  e.currentTarget.style.borderColor   = "var(--navy)";
}
function removeHover(e, isActive) {
  e.currentTarget.style.background    = isActive ? "var(--navy-light)" : "var(--bg-surface)";
  e.currentTarget.style.borderColor   = isActive ? "var(--navy)"       : "var(--border)";
}
function applyFocus(e) {
  e.currentTarget.style.outline       = "2px solid var(--navy)";
  e.currentTarget.style.outlineOffset = "2px";
}
function removeFocus(e) {
  e.currentTarget.style.outline       = "none";
}