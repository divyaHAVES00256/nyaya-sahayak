import { useState, useCallback } from "react";
import useAccessibilityStore from "../store/accessibilityStore";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { ttsEnabled, ttsSpeed, ttsVoiceLang } = useAccessibilityStore();

  const speak = useCallback(
    (text) => {
      if (!ttsEnabled) return;
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = ttsVoiceLang;
      utterance.rate = ttsSpeed;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, ttsSpeed, ttsVoiceLang]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}