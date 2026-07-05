import { useState, useEffect } from "react";
import { FileText, Home, ShoppingBag, Heart, Briefcase, Accessibility, Building, Shield, Clock } from "lucide-react";
import { LEGAL_TOPICS } from "../../constants/legalTopics";
import SectionHeading from "./SectionHeading";

const ICON_MAP = { FileText, Home, ShoppingBag, Heart, Briefcase, Accessibility, Building, Shield };

const TOPIC_FILL = {
  rti: 85, property: 72, consumer: 68, family: 60,
  labour: 55, disability: 78, schemes: 90, fir: 65,
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function TopicCard({ topic, Icon, fill, onSelect }) {
  const [hovered,  setHovered]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${topic.labelEnglish}, ${topic.act}, estimated 5 minutes`}
      onClick={() => onSelect(topic)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(topic); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        background:   "var(--bg-surface)",
        border:       "1px solid var(--border)",
        borderTop:    `4px solid ${topic.color}`,
        borderRadius: 10,
        padding:      20,
        cursor:       "pointer",
        boxShadow:    hovered ? "var(--shadow-hover)" : "var(--shadow-card)",
        transform:    hovered ? "translateY(-2px)" : "translateY(0)",
        transition:   "transform 120ms ease, box-shadow 120ms ease, background 0.25s ease, border-color 0.25s ease",
        outline:      "none",
        fontFamily:   "'Noto Sans', sans-serif",
      }}
    >
      {/* Row 1: icon + act badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width:          40,
            height:         40,
            borderRadius:   8,
            background:     hexToRgba(topic.color, 0.12),
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          {Icon && <Icon size={20} aria-hidden="true" style={{ color: topic.color }} />}
        </div>
        <span
          style={{
            fontSize:     10,
            color:        "var(--text-secondary)",
            background:   "var(--bg-surface-2)",
            border:       "1px solid var(--border)",
            borderRadius: 4,
            padding:      "2px 6px",
            lineHeight:   1.4,
            maxWidth:     110,
            textAlign:    "right",
            transition:   "background 0.25s ease, color 0.25s ease",
          }}
        >
          {topic.act}
        </span>
      </div>

      {/* Labels */}
      <p
        style={{
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
          fontSize:   15,
          fontWeight: 600,
          color:      "var(--text-primary)",
          margin:     "12px 0 0",
          lineHeight: 1.3,
          transition: "color 0.25s ease",
        }}
      >
        {topic.labelHindi}
      </p>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "3px 0 0", transition: "color 0.25s ease" }}>
        {topic.labelEnglish}
      </p>

      {/* Progress bar */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            background:   "var(--bg-surface-2)",
            height:       3,
            borderRadius: 2,
            width:        "100%",
            overflow:     "hidden",
            transition:   "background 0.25s ease",
          }}
        >
          <div
            style={{
              height:       "100%",
              borderRadius: 2,
              background:   topic.color,
              width:        mounted ? `${fill}%` : "0%",
              transition:   "width 0.6s ease",
            }}
          />
        </div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, transition: "color 0.25s ease" }}>
          Guide completeness
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginTop:      12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: topic.color }}>→ Start</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
          <Clock size={12} aria-hidden="true" />
          ~5 min
        </span>
      </div>
    </div>
  );
}

export default function LegalTopicsGrid({ onTopicSelect }) {
  return (
    <section id="legal-topics" aria-labelledby="topics-heading" style={{ marginTop: 24 }}>
      <SectionHeading
        id="topics-heading"
        titleDeva="कानूनी विषय"
        subtitle="Legal Topics — Select to begin"
      />

      <div
        className="topics-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
      >
        {LEGAL_TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            Icon={ICON_MAP[topic.icon]}
            fill={TOPIC_FILL[topic.id] ?? 50}
            onSelect={onTopicSelect}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 800px) { .topics-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .topics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}