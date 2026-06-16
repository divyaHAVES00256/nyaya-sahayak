import { useEffect } from "react";
import { Volume2, VolumeX, Type, Contrast, Globe } from "lucide-react";
import useAccessibilityStore from "../../store/accessibilityStore";
import { useTTS } from "../../hooks/useTTS";

const fontSizeCycle = ["normal", "large", "xlarge"];
const fontSizeLabels = { normal: "A", large: "A+", xlarge: "A++" };

const languageOptions = [
  { value: "hindi", label: "हिन्दी" },
  { value: "english", label: "English" },
  { value: "hinglish", label: "Hinglish" },
];

const languageSpeakNames = {
  hindi: "हिन्दी भाषा चुनी गई",
  english: "English language selected",
  hinglish: "Hinglish language selected",
};

export default function AccessibilityToolbar() {
  const {
    ttsEnabled,
    toggleTTS,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    language,
    setLanguage,
  } = useAccessibilityStore();

  const { speak } = useTTS();

  const handleToggleTTS = () => {
    toggleTTS();
    // Speak only if we're turning TTS ON (current state is false → becoming true)
    if (!ttsEnabled) {
      setTimeout(() => speak("Text to speech is on"), 100);
    }
  };

  const handleFontSize = () => {
    const currentIndex = fontSizeCycle.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % fontSizeCycle.length;
    setFontSize(fontSizeCycle[nextIndex]);
  };

  const handleLanguage = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setTimeout(() => speak(languageSpeakNames[newLang] || newLang), 100);
  };

  return (
    <div
      role="toolbar"
      aria-label="Accessibility options"
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
        {/* TTS Toggle */}
        <button
          onClick={handleToggleTTS}
          aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
          aria-pressed={ttsEnabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#185FA5]
            hover:bg-[#E6F1FB]
            aria-pressed:bg-[#185FA5] aria-pressed:text-white aria-pressed:border-[#185FA5]
            border-gray-300 text-gray-700"
          style={ttsEnabled ? { backgroundColor: "#185FA5", color: "#fff", borderColor: "#185FA5" } : {}}
        >
          {ttsEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          <span>{ttsEnabled ? "TTS On" : "TTS Off"}</span>
        </button>

        {/* Font Size Cycle */}
        <button
          onClick={handleFontSize}
          aria-label={`Font size: ${fontSize}. Click to cycle to next size.`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border border-gray-300 text-gray-700 transition-colors hover:bg-[#E6F1FB] focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
        >
          <Type size={16} aria-hidden="true" />
          <span>{fontSizeLabels[fontSize]}</span>
        </button>

        {/* High Contrast Toggle */}
        <button
          onClick={toggleHighContrast}
          aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
          aria-pressed={highContrast}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#185FA5]
            border-gray-300 text-gray-700 hover:bg-[#E6F1FB]"
          style={highContrast ? { backgroundColor: "#000", color: "#fff", borderColor: "#fff" } : {}}
        >
          <Contrast size={16} aria-hidden="true" />
          <span>Contrast</span>
        </button>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5">
          <Globe size={16} className="text-gray-500" aria-hidden="true" />
          <label htmlFor="language-select" className="sr-only">
            Select language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguage}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#185FA5] hover:bg-[#E6F1FB] cursor-pointer"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gov branding */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            भारत सरकार · Government of India
          </span>
        </div>
      </div>
    </div>
  );
}