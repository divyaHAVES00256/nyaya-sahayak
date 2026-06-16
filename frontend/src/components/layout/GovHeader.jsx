import { Volume2, VolumeX, Type, Contrast } from "lucide-react";
import useAccessibilityStore from "../../store/accessibilityStore";
import { useTTS } from "../../hooks/useTTS";
import SkipToContent from "../accessibility/SkipToContent";
import AshokaEmblem from "../../assets/ashoka-emblem.svg";

const fontSizeCycle = ["normal", "large", "xlarge"];

const NAV_TABS = [
  { id: "home", labelHindi: "होम", labelEnglish: "Home" },
  { id: "legal", labelHindi: "कानूनी सहायता", labelEnglish: "Legal Help" },
  { id: "docs", labelHindi: "दस्तावेज़", labelEnglish: "Documents" },
  { id: "help", labelHindi: "सहायता", labelEnglish: "Help" },
];

export default function GovHeader({ activeTab = "home", onTabChange }) {
  const { ttsEnabled, toggleTTS, fontSize, setFontSize, toggleHighContrast } =
    useAccessibilityStore();
  const { speak } = useTTS();

  const handleToggleTTS = () => {
    toggleTTS();
    if (!ttsEnabled) {
      setTimeout(() => speak("Text to speech is on"), 100);
    }
  };

  const handleFontSize = () => {
    const currentIndex = fontSizeCycle.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % fontSizeCycle.length;
    setFontSize(fontSizeCycle[nextIndex]);
  };

  const handleScreenReader = () => {
    speak("Screen reader mode active");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ "--header-height": "120px" }}
    >
      <SkipToContent />

      {/* Top strip */}
      <div className="bg-[#003580] text-white flex items-center justify-between px-4"
        style={{ height: "28px", fontSize: "11px" }}>
        <span className="devanagari">
          भारत सरकार{" "}
          <span className="mx-1 opacity-60">|</span>{" "}
          Government of India
        </span>
        <div className="flex items-center gap-4">
          <a
            href="#main-content"
            className="text-white underline hover:text-yellow-200 focus:outline-none focus:ring-1 focus:ring-white rounded"
          >
            Skip to main content
          </a>
          <button
            onClick={handleScreenReader}
            className="text-white underline hover:text-yellow-200 focus:outline-none focus:ring-1 focus:ring-white rounded bg-transparent border-0 cursor-pointer p-0"
            style={{ fontSize: "11px" }}
          >
            Screen Reader Access
          </button>
        </div>
      </div>

      {/* Main header bar */}
      <div className="bg-white border-b-2 border-[#D0D7E2] py-3 px-6 flex items-center justify-between">
        {/* Left: Emblem + App name */}
        <div className="flex items-center gap-3">
          <img
            src={AshokaEmblem}
            alt="Ashoka Emblem — Government of India"
            style={{ height: "52px", width: "auto" }}
          />
          <div>
            <div
              className="devanagari font-bold text-[#003580]"
              style={{ fontSize: "20px", lineHeight: "1.2" }}
            >
              न्याय सहायक
            </div>
            <div className="text-[#4A5568]" style={{ fontSize: "12px" }}>
              Nyaya Sahayak — Legal Aid Assistant
            </div>
          </div>
        </div>

        {/* Right: Utility buttons */}
        <div className="flex items-center gap-2">
          {/* TTS toggle */}
          <button
            onClick={handleToggleTTS}
            aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
            aria-pressed={ttsEnabled}
            className="flex items-center justify-center rounded border border-[#D0D7E2] transition-colors hover:bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-[#003580] focus:ring-offset-2"
            style={{ width: "36px", height: "36px" }}
          >
            {ttsEnabled ? (
              <Volume2 size={16} aria-hidden="true" className="text-[#003580]" />
            ) : (
              <VolumeX size={16} aria-hidden="true" className="text-[#718096]" />
            )}
          </button>

          {/* Font size cycle */}
          <button
            onClick={handleFontSize}
            aria-label={`Font size: ${fontSize}. Click to cycle.`}
            className="flex items-center justify-center rounded border border-[#D0D7E2] transition-colors hover:bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-[#003580] focus:ring-offset-2 text-[#003580] font-semibold"
            style={{ width: "36px", height: "36px", fontSize: "13px" }}
          >
            <Type size={16} aria-hidden="true" />
          </button>

          {/* High contrast toggle */}
          <button
            onClick={toggleHighContrast}
            aria-label="Toggle high contrast mode"
            className="flex items-center justify-center rounded border border-[#D0D7E2] transition-colors hover:bg-[#F1F4F8] focus:outline-none focus:ring-2 focus:ring-[#003580] focus:ring-offset-2"
            style={{ width: "36px", height: "36px" }}
          >
            <Contrast size={16} aria-hidden="true" className="text-[#003580]" />
          </button>
        </div>
      </div>

      {/* Navigation tab bar */}
      <nav
        role="tablist"
        aria-label="Main navigation"
        className="bg-[#003580] flex items-stretch px-4"
        style={{ minHeight: "40px" }}
      >
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange?.(tab.id)}
              className={[
                "px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset",
                isActive
                  ? "bg-white text-[#003580] font-semibold"
                  : "text-white hover:bg-white/15",
              ].join(" ")}
            >
              <span className="devanagari">{tab.labelHindi}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}