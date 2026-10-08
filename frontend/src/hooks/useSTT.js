import { useCallback, useEffect, useRef, useState } from "react";
import { transcribeSpeech } from "../services/legalSearch";

/**
 * Records a microphone clip and asks the backend's Whisper model to transcribe it.
 * The browser only captures audio; the actual speech recognition runs locally in Python.
 */
export function useSTT(onTranscript) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [languageTag, setLanguageTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported] = useState(
    () =>
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== "undefined"
  );
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const onTranscriptRef = useRef(onTranscript);
  const mountedRef = useRef(true);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported || isListening || isTranscribing) return;

    setTranscript("");
    setLanguageTag("");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (mountedRef.current) {
          setIsListening(false);
          setErrorMessage("The browser could not record microphone audio. Try again.");
        }
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (!mountedRef.current) return;

        setIsListening(false);
        if (chunksRef.current.length === 0) {
          setErrorMessage("No audio was recorded. Try speaking before you stop.");
          return;
        }

        setIsTranscribing(true);
        try {
          const audio = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          const result = await transcribeSpeech(audio);
          if (!mountedRef.current) return;
          setTranscript(result.text);
          setLanguageTag(result.language_tags.join("+"));
          onTranscriptRef.current?.(result.text);
        } catch (error) {
          if (mountedRef.current) setErrorMessage(error.message);
        } finally {
          if (mountedRef.current) setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsListening(false);
      setErrorMessage(
        error.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow microphone access for this site, then try again."
          : `Could not start microphone recording: ${error.message}`
      );
    }
  }, [isListening, isSupported, isTranscribing]);

  const stopListening = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
  }, []);

  return {
    startListening,
    stopListening,
    transcript,
    languageTag,
    isListening,
    isTranscribing,
    isSupported,
    errorMessage,
  };
}
