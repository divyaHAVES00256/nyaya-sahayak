import { Mic2, Scale, FileDown, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    number:    1,
    color:     "#FF6200",
    colorVar:  "var(--saffron)",
    Icon:      Mic2,
    titleDeva: "बोलें या टाइप करें",
    subtitle:  "Speak or type in Hindi, English, or Hinglish",
  },
  {
    number:    2,
    color:     "#003580",
    colorVar:  "var(--navy)",
    Icon:      Scale,
    titleDeva: "कानूनी सलाह पाएं",
    subtitle:  "Get plain-language legal guidance instantly",
  },
  {
    number:    3,
    color:     "#046A38",
    colorVar:  "var(--green)",
    Icon:      FileDown,
    titleDeva: "दस्तावेज़ डाउनलोड करें",
    subtitle:  "Download RTI drafts, legal notices & more",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" style={{ marginTop: 24 }}>
      <SectionHeading
        id="how-heading"
        titleDeva="कैसे काम करता है"
        subtitle="How Nyaya Sahayak works — 3 simple steps"
      />

      <div
        className="steps-row"
        style={{ display: "flex", alignItems: "center", marginTop: 16 }}
      >
        {STEPS.map((step, i) => (
          <>
            <div
              key={step.number}
              style={{
                flex:         1,
                background:   "var(--bg-surface)",
                border:       "1px solid var(--border)",
                borderRadius: 10,
                padding:      20,
                textAlign:    "center",
                boxShadow:    "var(--shadow-card)",
                fontFamily:   "'Noto Sans', sans-serif",
                transition:   "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              {/* Step circle */}
              <div
                aria-hidden="true"
                style={{
                  width:          44,
                  height:         44,
                  borderRadius:   "50%",
                  background:     step.colorVar,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       18,
                  fontWeight:     700,
                  color:          "white",
                  margin:         "0 auto",
                  transition:     "background 0.25s ease",
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <step.Icon
                  size={28}
                  aria-hidden="true"
                  style={{ color: step.colorVar, transition: "color 0.25s ease" }}
                />
              </div>

              {/* Title */}
              <p
                style={{
                  fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
                  fontSize:   14,
                  fontWeight: 600,
                  color:      "var(--text-primary)",
                  margin:     "8px 0 0",
                  lineHeight: 1.3,
                  transition: "color 0.25s ease",
                }}
              >
                {step.titleDeva}
              </p>

              {/* Subtitle */}
              <p
                style={{
                  fontSize:   12,
                  color:      "var(--text-secondary)",
                  lineHeight: 1.5,
                  margin:     "4px 0 0",
                  transition: "color 0.25s ease",
                }}
              >
                {step.subtitle}
              </p>
            </div>

            {/* Arrow between steps */}
            {i < STEPS.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  padding:    "0 8px",
                  display:    "flex",
                  alignItems: "center",
                  paddingBottom: 20,
                }}
              >
                <ChevronRight size={24} style={{ color: "var(--border-strong)", transition: "color 0.25s ease" }} />
              </div>
            )}
          </>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .steps-row { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
    </section>
  );
}