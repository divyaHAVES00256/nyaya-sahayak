import React, { useState, useEffect } from "react";
import { FileText, Home, ShoppingBag, Heart, Briefcase, Accessibility, Building, Shield, Clock } from "lucide-react";
import { LEGAL_TOPICS } from "../../constants/legalTopics";

const ICON_MAP = { FileText, Home, ShoppingBag, Heart, Briefcase, Accessibility, Building, Shield };
const TOPIC_FILL = { rti: 85, property: 72, consumer: 68, family: 60, labour: 55, disability: 78, schemes: 90, fir: 65 };

// ─── Helper: hexToRgba ────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

// ─── Sub-Component: Topic Card ────────────────────────────────────────────────
function TopicCard({ topic, Icon, fill, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(topic);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        background: "white",
        border: "1px solid #D0D7E2",
        borderTop: `4px solid ${topic.color}`,
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        boxShadow: hovered
          ? "0 6px 20px rgba(0,0,0,0.10)"
          : "0 2px 8px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        outline: "none",
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      {/* Row 1: icon + act badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: hexToRgba(topic.color, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {Icon && (
            <Icon size={20} aria-hidden="true" style={{ color: topic.color }} />
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            color: "#4A5568",
            background: "#F1F4F8",
            border: "1px solid #D0D7E2",
            borderRadius: 4,
            padding: "2px 6px",
            lineHeight: 1.4,
            maxWidth: 110,
            textAlign: "right",
          }}
        >
          {topic.act}
        </span>
      </div>

      {/* Row 2 & 3: labels */}
      <p
        style={{
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: "#0D0D0D",
          margin: "12px 0 0",
          lineHeight: 1.3,
        }}
      >
        {topic.labelHindi}
      </p>
      <p style={{ fontSize: 12, color: "#4A5568", margin: "3px 0 0" }}>
        {topic.labelEnglish}
      </p>

      {/* Row 4: progress bar */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            background: "#F1F4F8",
            height: 3,
            borderRadius: 2,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              background: topic.color,
              width: mounted ? `${fill}%` : "0%",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <p style={{ fontSize: 10, color: "#718096", marginTop: 4 }}>
          Guide completeness
        </p>
      </div>

      {/* Row 5: start + time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: topic.color }}>
          → Start
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#718096",
          }}
        >
          <Clock size={12} aria-hidden="true" style={{ color: "#718096" }} />
          ~5 min
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LegalTopicsGrid({ onTopicSelect }) {
  return (
    <section id="legal-topics" aria-labelledby="topics-heading" style={{ marginTop: 24 }}>
      <SectionHeading
        id="topics-heading"
        titleDeva="कानूनी विषय"
        subtitle="Legal Topics — Select to begin"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
        className="topics-grid"
      >
        {LEGAL_TOPICS.map((topic) => {
          const Icon = ICON_MAP[topic.icon];
          const fill = TOPIC_FILL[topic.id] ?? 50;

          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              Icon={Icon}
              fill={fill}
              onSelect={onTopicSelect}
            />
          );
        })}
      </div>

      <style>{`
        @media (max-width: 800px) {
          .topics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .topics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}