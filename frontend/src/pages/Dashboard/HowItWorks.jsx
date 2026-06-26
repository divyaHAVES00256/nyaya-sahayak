import React from "react";
import { Mic2, Scale, FileDown, ChevronRight } from "lucide-react";

// ─── Helper: Section Heading ──────────────────────────────────────────────────
function SectionHeading({ titleDeva, subtitle, id }) {
  return (
    <div className="mb-4">
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 3,
          background: "#FF6200",
          marginBottom: 8,
          borderRadius: 0,
        }}
      />
      <h2
        id={id}
        style={{
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#003580",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {titleDeva}
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#4A5568",
          fontWeight: 400,
          margin: "4px 0 0",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      color: "#FF6200",
      Icon: Mic2,
      titleDeva: "बोलें या टाइप करें",
      subtitle: "Speak or type in Hindi, English, or Hinglish",
    },
    {
      number: 2,
      color: "#003580",
      Icon: Scale,
      titleDeva: "कानूनी सलाह पाएं",
      subtitle: "Get plain-language legal guidance instantly",
    },
    {
      number: 3,
      color: "#046A38",
      Icon: FileDown,
      titleDeva: "दस्तावेज़ डाउनलोड करें",
      subtitle: "Download RTI drafts, legal notices & more",
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      style={{ marginTop: 24 }}
    >
      <SectionHeading
        id="how-heading"
        titleDeva="कैसे काम करता है"
        subtitle="How Nyaya Sahayak works — 3 simple steps"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginTop: 16,
        }}
        className="steps-row"
      >
        {steps.map((step, i) => (
          <React.Fragment key={step.number}>
            <div
              style={{
                flex: 1,
                background: "white",
                border: "1px solid #D0D7E2",
                borderRadius: 10,
                padding: 20,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontFamily: "'Noto Sans', sans-serif",
              }}
            >
              {/* Step circle */}
              <div
                aria-hidden="true"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: step.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                  margin: "0 auto",
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <step.Icon
                  size={28}
                  aria-hidden="true"
                  style={{ color: step.color }}
                />
              </div>

              {/* Title */}
              <p
                style={{
                  fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0D0D0D",
                  margin: "8px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {step.titleDeva}
              </p>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 12,
                  color: "#4A5568",
                  lineHeight: 1.5,
                  margin: "4px 0 0",
                }}
              >
                {step.subtitle}
              </p>
            </div>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <div
                aria-hidden="true"
                className="step-arrow"
                style={{
                  flexShrink: 0,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  paddingBottom: 20,
                }}
              >
                <ChevronRight size={24} style={{ color: "#D0D7E2" }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .steps-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .steps-row .step-arrow {
            transform: rotate(90deg);
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}