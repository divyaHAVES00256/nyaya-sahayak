import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Mic, UploadCloud, Send, Sparkles, Users } from "lucide-react";
import PageShell from "../components/layout/PageShell";

export default function ChatPage({ activeTab, onTabChange, chatHistory, onSendMessage }) {
  const [draft, setDraft] = useState("");
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [rightTab, setRightTab] = useState("document");
  const messagesEndRef = useRef(null);

  const visibleHistory = useMemo(
    () => chatHistory.slice(-10),
    [chatHistory]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleHistory, assistantTyping]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    onSendMessage({ role: "user", text: trimmed });
    setDraft("");
    setAssistantTyping(true);

    window.setTimeout(() => {
      onSendMessage({
        role: "assistant",
        text: "I am checking the relevant laws and guidance. Please hold on while I prepare a response for you.",
      });
      setAssistantTyping(false);
    }, 650);
  }

  return (
    <PageShell showSidebar={false} activeTab={activeTab} onTabChange={onTabChange}>
      <div style={{ minHeight: "calc(100vh - 120px)", backgroundColor: "#081327", color: "#f8fbff", padding: "24px 24px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#9fb7f2", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <Sparkles size={14} /> Chat Hub
            </div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700, lineHeight: 1.1 }}>नमस्ते — आपकी क्या सहायता कर सकता हूँ?</h1>
            <p style={{ margin: "16px 0 0", color: "rgba(248,251,255,0.75)", fontSize: 15, maxWidth: 680, lineHeight: 1.75 }}>
              Ask anything about Indian law in Hindi, English, or Hinglish. Every answer is spoken aloud — no reading required.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 10,
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              A+ Large Text
            </button>
            <button
              type="button"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 10,
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Dark
            </button>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(248,251,255,0.75)", minWidth: 60 }}>Speech rate</span>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                defaultValue="0.85"
                style={{ width: 120 }}
              />
              <span style={{ fontSize: 12, color: "rgba(248,251,255,0.75)" }}>0.85x</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.85fr", gap: "22px", alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                flex: 1,
                borderRadius: 24,
                backgroundColor: "rgba(15, 30, 61, 0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "22px 24px 0 24px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "rgba(248,251,255,0.72)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Chat Stream
                </div>
                {assistantTyping && (
                  <div style={{ color: "#8bd2ff", fontSize: 13, padding: "6px 12px", borderRadius: 999, backgroundColor: "rgba(77, 136, 211, 0.18)" }}>
                    Bot is typing...
                  </div>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 24px 0 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {visibleHistory.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      alignSelf: message.role === "assistant" ? "flex-start" : "flex-end",
                      maxWidth: "82%",
                      backgroundColor: message.role === "assistant" ? "rgba(255,255,255,0.10)" : "rgba(79, 118, 255, 0.20)",
                      border: message.role === "assistant" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(79, 118, 255, 0.35)",
                      borderRadius: message.role === "assistant" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                      color: "#f8fbff",
                      padding: "16px 18px",
                      boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
                      lineHeight: 1.7,
                      fontSize: 15,
                    }}
                  >
                    {message.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "18px 20px 20px 20px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(9, 18, 47, 0.84)",
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="अपना कानूनी सवाल लिखें... / Type your legal question here..."
                  style={{
                    flex: 1,
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 16px",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    color: "#f8fbff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: "#ffb300",
                    color: "#081327",
                    border: "none",
                    borderRadius: 14,
                    padding: "12px 18px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Send
                  <Send size={16} aria-hidden="true" />
                </button>
              </form>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              <button
                type="button"
                style={buttonChunkStyle}
              >
                <Mic size={16} /> Wake Bot
              </button>
              <button
                type="button"
                style={buttonChunkStyle}
              >
                <UploadCloud size={16} /> Upload Doc
              </button>
              <button
                type="button"
                style={buttonChunkStyle}
              >
                <Users size={16} /> Human Help
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ borderRadius: 24, backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", padding: "18px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setRightTab("document")}
                  style={tabButtonStyle(rightTab === "document")}
                >
                  <FileText size={16} /> Document
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab("human")}
                  style={tabButtonStyle(rightTab === "human")}
                >
                  <Users size={16} /> Human Help
                </button>
              </div>
              {rightTab === "document" ? (
                <div style={{ color: "rgba(248,251,255,0.78)", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Upload a legal document (PDF or image).</div>
                    <div style={{ fontSize: 13, color: "rgba(248,251,255,0.62)", lineHeight: 1.7 }}>
                      I will read it and answer your questions.
                    </div>
                  </div>
                  <button
                    type="button"
                    style={panelButtonStyle}
                  >
                    Upload File
                  </button>
                </div>
              ) : (
                <div style={{ color: "rgba(248,251,255,0.78)", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Get help from a trained legal support person.</div>
                    <div style={{ fontSize: 13, color: "rgba(248,251,255,0.62)", lineHeight: 1.7 }}>
                      Connect to human guidance for more complex questions.
                    </div>
                  </div>
                  <button
                    type="button"
                    style={panelButtonStyle}
                  >
                    Request Support
                  </button>
                </div>
              )}
            </div>

            <div style={{ borderRadius: 24, backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Quick actions</div>
                <button
                  type="button"
                  style={{
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 10,
                    background: "transparent",
                    color: "rgba(248,251,255,0.78)",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <button type="button" style={panelButtonStyle}>New Chat</button>
                <button type="button" style={panelButtonStyle}>Emergency</button>
                <button type="button" style={panelButtonStyle}>Stop</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const buttonChunkStyle = {
  borderRadius: 16,
  padding: "14px 16px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f8fbff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const panelButtonStyle = {
  width: "100%",
  borderRadius: 16,
  padding: "14px 16px",
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f8fbff",
  fontWeight: 700,
  cursor: "pointer",
};

const tabButtonStyle = (active) => ({
  flex: 1,
  borderRadius: 14,
  padding: "12px 14px",
  backgroundColor: active ? "rgba(255,255,255,0.14)" : "transparent",
  color: active ? "#ffffff" : "rgba(248,251,255,0.7)",
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
});
