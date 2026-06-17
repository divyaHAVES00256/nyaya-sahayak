// src/pages/Dashboard.jsx
// Main landing page — replaces Home.jsx from Phase 1.
// Wrapped in PageShell. Four sections:
//   A) Welcome banner    — identity + primary CTAs
//   B) Stats row         — 3 quick-stat GovCards
//   C) Legal topics grid — 8 topic GovCards (4×2)
//   D) How to use        — 3 sequential steps

import { useEffect, useState } from "react";
import { Scale, FileText, Phone, Mic, ChevronRight,
         FileText as FileTextIcon,
         Home, ShoppingBag, Heart, Briefcase,
         Accessibility, Building, Shield } from "lucide-react";
import PageShell from "../components/layout/PageShell";
import GovCard from "../components/ui/GovCard";
import GovBadge from "../components/ui/GovBadge";
import GovButton from "../components/ui/GovButton";
import { LEGAL_TOPICS } from "../constants/legalTopics";
import { useTTS } from "../hooks/useTTS";
import ashokaEmblem from "../assets/ashoka-emblem.svg";

// Icon map — same pattern as Sidebar so legalTopics.js stays a pure data file
const ICON_MAP = {
  FileText,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
};

// Badge color per topic — maps topic accent hex to GovBadge color prop
function accentToBadgeColor(hex) {
  const map = {
    "#003580": "blue",
    "#046A38": "green",
    "#FF6200": "saffron",
    "#C8960C": "gold",
    "#4A5568": "grey",
  };
  return map[hex] ?? "grey";
}

export default function Dashboard() {
  const { speak } = useTTS();
  const [activeTopic, setActiveTopic] = useState("rti");

  // Speak welcome message on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(
        "Namaste! Nyaya Sahayak is ready. Press Tab to navigate or say your legal question."
      );
    }, 600); // slight delay so page has settled before speaking
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTopicClick(topic) {
    setActiveTopic(topic.id);
    speak(`${topic.labelEnglish} selected. ${topic.act}`);
  }

  function handleStartChat() {
    speak("Opening legal chat. Please speak or type your question.");
  }

  function handleBrowseTopics() {
    // Scroll the legal topics section into view and announce
    document.getElementById("legal-topics-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    speak("Showing all legal topics. Use Tab or arrow keys to browse.");
  }

  return (
    <PageShell>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "1100px",
        }}
      >

        {/* ══════════════════════════════════════════
            SECTION A — Welcome banner
        ══════════════════════════════════════════ */}
        <section aria-labelledby="welcome-heading">
          <div
            style={{
              backgroundColor: "#003580",
              borderRadius: "10px",
              padding: "32px",
              // Subtle Tiranga-inspired right-edge accent — saffron stripe
              borderRight: "6px solid #FF6200",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Emblem + greeting row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <img
                src={ashokaEmblem}
                alt="Ashoka Emblem"
                style={{ height: "52px", width: "auto", flexShrink: 0 }}
              />
              <h1
                id="welcome-heading"
                style={{
                  margin: 0,
                  fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                <span className="devanagari">नमस्ते!</span>
                <span
                  style={{
                    fontFamily: "'Noto Sans', sans-serif",
                    marginLeft: "8px",
                    fontWeight: 400,
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  / Namaste!
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p
              style={{
                margin: "0 0 24px 0",
                fontFamily: "'Noto Sans', sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.6,
                maxWidth: "560px",
              }}
            >
              Nyaya Sahayak is ready to assist you with legal queries in{" "}
              <strong style={{ color: "#ffffff" }}>Hindi, English, or Hinglish</strong>.
              Ask a question by voice or text — plain language, no legal jargon.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <GovButton
                variant="secondary"
                size="lg"
                icon={Mic}
                onClick={handleStartChat}
                ariaLabel="Start legal chat — speak or type your question"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#003580",
                  borderColor: "#ffffff",
                  fontWeight: 600,
                }}
              >
                Start Legal Chat
                <ChevronRight size={16} aria-hidden="true" />
              </GovButton>

              <GovButton
                variant="ghost"
                size="lg"
                onClick={handleBrowseTopics}
                ariaLabel="Browse all legal topics"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                Browse Topics
              </GovButton>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION B — Stats row (3 cards)
        ══════════════════════════════════════════ */}
        <section aria-label="Quick statistics">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {/* Stat 1 — Legal domains */}
            <GovCard
              icon={Scale}
              title="8 Legal Domains"
              subtitle="RTI, Property, Consumer, Family & more"
              accentColor="#003580"
              badge={<GovBadge label="Active" color="blue" />}
              style={{ height: "100%" }}
            />

            {/* Stat 2 — Most used guide */}
            <GovCard
              icon={FileTextIcon}
              title="RTI Filing Guide"
              subtitle="Step-by-step application in plain Hindi"
              accentColor="#FF6200"
              badge={<GovBadge label="Most Used" color="saffron" />}
              style={{ height: "100%" }}
            />

            {/* Stat 3 — Helpline */}
            <GovCard
              icon={Phone}
              title="Helpline 1516"
              subtitle="National Legal Services Authority"
              accentColor="#046A38"
              badge={<GovBadge label="24x7" color="green" />}
              style={{ height: "100%" }}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION C — Legal topics grid (4 × 2)
        ══════════════════════════════════════════ */}
        <section
          id="legal-topics-section"
          aria-labelledby="topics-heading"
        >
          {/* Section heading */}
          <h2
            id="topics-heading"
            style={{
              margin: "0 0 14px 0",
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#0D0D0D",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "4px",
                height: "18px",
                backgroundColor: "#FF6200",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <span className="devanagari" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              कानूनी विषय
            </span>
            <span style={{ color: "#718096", fontWeight: 400 }}>/ Legal Topics</span>
          </h2>

          {/* 4-column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
            }}
            role="list"
            aria-label="Legal topic cards"
          >
            {LEGAL_TOPICS.map((topic) => {
              const IconComponent = ICON_MAP[topic.icon];
              const isActive = activeTopic === topic.id;

              return (
                <div key={topic.id} role="listitem">
                  <GovCard
                    icon={IconComponent}
                    title={topic.labelHindi}
                    subtitle={topic.act}
                    accentColor={topic.color}
                    onClick={() => handleTopicClick(topic)}
                    ariaLabel={`${topic.labelEnglish} — ${topic.act}`}
                    badge={
                      isActive
                        ? <GovBadge
                            label="Selected"
                            color={accentToBadgeColor(topic.color)}
                          />
                        : undefined
                    }
                    style={{
                      height: "100%",
                      // Subtle active ring
                      outline: isActive ? `2px solid ${topic.color}` : "none",
                      outlineOffset: "2px",
                    }}
                  >
                    {/* English label below the act subtitle */}
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Noto Sans', sans-serif",
                        fontSize: "12px",
                        color: "#718096",
                        lineHeight: 1.4,
                      }}
                    >
                      {topic.labelEnglish}
                    </p>
                  </GovCard>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION D — How to use (3 steps)
        ══════════════════════════════════════════ */}
        <section aria-labelledby="howto-heading">
          <h2
            id="howto-heading"
            style={{
              margin: "0 0 14px 0",
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#0D0D0D",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "4px",
                height: "18px",
                backgroundColor: "#003580",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            How to Use Nyaya Sahayak
          </h2>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {HOW_TO_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  style={{
                    flex: "1 1 200px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #D0D7E2",
                    borderRadius: "8px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Step number badge + icon in a row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* Number badge */}
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#FF6200",
                        color: "#ffffff",
                        fontFamily: "'Noto Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {step.number}
                    </span>

                    {/* Step icon */}
                    <StepIcon
                      size={22}
                      aria-hidden="true"
                      color="#003580"
                    />
                  </div>

                  {/* Step text */}
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Noto Sans', sans-serif",
                      fontSize: "13px",
                      color: "#4A5568",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </PageShell>
  );
}

// ── Step data — kept outside component to avoid re-creation on each render ──
const HOW_TO_STEPS = [
  {
    number: 1,
    icon: Mic,
    text: "Speak or type your legal question in Hindi, English, or Hinglish — no legal terminology needed.",
  },
  {
    number: 2,
    icon: Scale,
    text: "Get plain-language guidance on your rights, applicable laws, and next steps.",
  },
  {
    number: 3,
    icon: FileTextIcon,
    text: "Download filled application forms, get referrals to legal aid centres, or call helpline 1516.",
  },
];