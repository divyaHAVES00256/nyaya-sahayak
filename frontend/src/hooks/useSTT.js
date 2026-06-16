import { useState, useRef, useCallback, useEffect } from "react";
import useAccessibilityStore from "../store/accessibilityStore";

const langMap = {
  hindi: "hi-IN",
  english: "en-IN",
  hinglish: "hi-IN",
};

export function useSTT() {
  const { language } = useAccessibilityStore();
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      setTranscript(finalText || interimText);
    };

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event) => {
      console.error("STT error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setIsSupported(false);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("STT start error:", e);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error("STT stop error:", e);
    }
  }, []);

  return { startListening, stopListening, transcript, isListening, isSupported };
}