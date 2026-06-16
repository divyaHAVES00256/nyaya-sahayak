import { create } from "zustand";

const useAccessibilityStore = create((set) => ({
  fontSize: "normal",
  highContrast: false,
  ttsEnabled: true,
  ttsSpeed: 1.0,
  ttsVoiceLang: "hi-IN",
  language: "hindi",

  setFontSize: (size) => set({ fontSize: size }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  toggleTTS: () => set((state) => ({ ttsEnabled: !state.ttsEnabled })),
  setTTSSpeed: (speed) => set({ ttsSpeed: speed }),
  setLanguage: (lang) => {
    const langMap = {
      hindi: "hi-IN",
      english: "en-IN",
      hinglish: "hi-IN",
    };
    set({ language: lang, ttsVoiceLang: langMap[lang] || "hi-IN" });
  },
}));

export default useAccessibilityStore;