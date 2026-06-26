import { MessageCircle, Grid, FileText, Home, Shield } from "lucide-react";

export default function HeroBanner({ onBrowseTopics }) {
  return (
    <div
      style={{
        background: "#003580",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        minHeight: 220,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* Diagonal grid watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 50%)",
          backgroundSize: "20px 20px",
          pointerEvents: "none",
        }}
      />
 
      {/* Left column */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "60%",
          padding: 32,
          boxSizing: "border-box",
          fontFamily: "'Noto Sans', sans-serif",
        }}
      >
        {/* Pill badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 500,
            color: "white",
          }}
        >
          🇮🇳&nbsp; भारत सरकार की पहल &bull; Government of India Initiative
        </span>
 
        {/* Heading */}
        <p
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            margin: "12px 0 0",
            lineHeight: 1.2,
          }}
        >
          न्याय सहायक
        </p>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 400,
            margin: "4px 0 0",
          }}
        >
          Your Legal Rights. Your Language.
        </p>
 
        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.70)",
            maxWidth: 420,
            lineHeight: 1.6,
            margin: "12px 0 0",
          }}
        >
          Get free legal guidance in Hindi, English, or Hinglish. Built for
          every Indian citizen — especially those who need it most.
        </p>
 
        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            aria-label="Start legal chat in your language"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#FF6200",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Noto Sans', sans-serif",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e05500")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FF6200")}
            onFocus={(e) => (e.currentTarget.style.outline = "2px solid white")}
            onBlur={(e) => (e.currentTarget.style.outline = "none")}
          >
            <MessageCircle size={16} aria-hidden="true" />
            चैट शुरू करें &bull; Start Chat
          </button>
 
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.5)",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 400,
              cursor: "pointer",
              fontFamily: "'Noto Sans', sans-serif",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.10)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onFocus={(e) => (e.currentTarget.style.outline = "2px solid white")}
            onBlur={(e) => (e.currentTarget.style.outline = "none")}
            onClick={onBrowseTopics}
          >
            <Grid size={16} aria-hidden="true" />
            विषय देखें &bull; Browse Topics
          </button>
        </div>
      </div>
 
      {/* Right decorative panel — hidden below 900px via inline media trick */}
      <div
        aria-hidden="true"
        className="hero-deco-panel"
        style={{
          position: "absolute",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 12,
            padding: 16,
            width: 240,
            backdropFilter: "blur(4px)",
            fontFamily: "'Noto Sans', sans-serif",
          }}
        >
          {/* AI status row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: "#4CAF50",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", flex: 1 }}
            >
              AI Online
            </span>
            <span className="loading-dots">
              <span />
              <span />
              <span />
            </span>
          </div>
 
          {/* Query pills */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}
          >
            {[
              { Icon: FileText, text: "RTI कैसे दाखिल करें?" },
              { Icon: Home, text: "Property dispute help" },
              { Icon: Shield, text: "FIR status kaise check karein?" },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "white",
                }}
              >
                <Icon size={12} aria-hidden="true" style={{ flexShrink: 0, opacity: 0.8 }} />
                {text}
              </div>
            ))}
          </div>
 
          {/* Mic bar */}
          <div
            style={{
              background: "rgba(255,98,0,0.25)",
              border: "1px solid rgba(255,98,0,0.4)",
              borderRadius: 8,
              padding: "8px 12px",
              marginTop: 12,
              fontSize: 11,
              color: "white",
              textAlign: "center",
            }}
          >
            🎙️ Tap mic to speak your question
          </div>
        </div>
      </div>
 
      {/* CSS for decorative panel responsive hide + loading dots */}
      <style>{`
        @media (max-width: 900px) {
          .hero-deco-panel { display: none !important; }
        }
        .loading-dots {
          display: flex;
          gap: 3px;
          align-items: center;
        }
        .loading-dots span {
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: dotPulse 1.4s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}