import { useTTS } from "../hooks/useTTS";
import { useSTT } from "../hooks/useSTT";
import { Mic, MicOff, Volume2 } from "lucide-react";

export default function Home() {
  const { speak, isSpeaking } = useTTS();
  const { startListening, stopListening, transcript, isListening, isSupported } = useSTT();

  const handleSpeak = () => {
    speak("Nyaya Sahayak legal chatbot ready. Namaste!");
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-[#E6F1FB] flex flex-col items-center justify-center px-4 py-16">
      {/* Emblem / Logo area */}
      <div className="mb-8 flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full bg-[#185FA5] flex items-center justify-center mb-4 shadow-lg"
          aria-hidden="true"
        >
          <span className="text-white text-3xl font-bold select-none">न्या</span>
        </div>
        <p className="text-xs text-[#185FA5] font-semibold tracking-widest uppercase">
          Government of India Initiative
        </p>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold text-[#0C447C] text-center leading-tight mb-3">
        Nyaya Sahayak
      </h1>
      <p className="text-2xl text-[#185FA5] text-center mb-2 font-medium">न्याय सहायक</p>
      <p className="text-lg text-gray-600 text-center mb-12 max-w-md">
        Legal aid for every Indian citizen
      </p>

      {/* Test buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        {/* TTS Test */}
        <button
          onClick={handleSpeak}
          aria-label="Test text to speech"
          aria-busy={isSpeaking}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#185FA5] text-white font-medium shadow hover:bg-[#0C447C] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 disabled:opacity-60"
        >
          <Volume2 size={20} aria-hidden="true" />
          {isSpeaking ? "Speaking…" : "Test Voice"}
        </button>

        {/* STT Test */}
        <button
          onClick={handleMic}
          aria-label={isListening ? "Stop listening" : "Start microphone test"}
          aria-pressed={isListening}
          disabled={!isSupported}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={
            isListening
              ? { backgroundColor: "#27500A", color: "#fff" }
              : { backgroundColor: "#fff", color: "#185FA5", border: "2px solid #185FA5" }
          }
        >
          {isListening ? (
            <>
              <MicOff size={20} aria-hidden="true" />
              Stop Mic
            </>
          ) : (
            <>
              <Mic size={20} aria-hidden="true" />
              {isSupported ? "Test Mic" : "Mic Unavailable"}
            </>
          )}
        </button>
      </div>

      {/* Transcript display */}
      {(transcript || isListening) && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Speech transcript"
          className="w-full max-w-md bg-white border border-[#185FA5] rounded-xl px-6 py-4 shadow-md"
        >
          <p className="text-xs text-[#185FA5] font-semibold uppercase tracking-wide mb-1">
            {isListening ? "Listening…" : "Transcript"}
          </p>
          <p className="text-gray-800 text-base min-h-[1.5rem]">
            {transcript || (
              <span className="text-gray-400 italic">Speak now…</span>
            )}
          </p>
        </div>
      )}

      {/* Phase note */}
      <p className="mt-16 text-xs text-gray-400 text-center">
        Phase 1 · Accessibility Foundation
      </p>
    </div>
  );
}