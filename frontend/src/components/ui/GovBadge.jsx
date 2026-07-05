// src/components/ui/GovBadge.jsx
// Reusable pill badge — status labels, category tags, availability indicators.
// Colors: blue | saffron | green | gold | grey
// Intentionally tiny and self-contained — no external dependencies.

const COLOR_MAP = {
  blue: {
    backgroundColor: "var(--navy-light)",
    color: "var(--navy)",
    border: "1px solid var(--navy-border)",
  },
  saffron: {
    backgroundColor: "var(--saffron-light)",
    color: "var(--saffron)",
    border: "1px solid var(--saffron-border)",
  },
  green: {
    backgroundColor: "var(--green-light)",
    color: "var(--green)",
    border: "1px solid var(--green-border)",
  },
  gold: {
    backgroundColor: "var(--gold-light)",
    color: "var(--gold)",
    border: "1px solid var(--gold-border)",
  },
  grey: {
    backgroundColor: "var(--bg-surface-2)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  },
};

export default function GovBadge({ label, color = "grey" }) {
  const colorStyle = COLOR_MAP[color] ?? COLOR_MAP.grey;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        // Pill shape
        padding: "2px 8px",
        borderRadius: "999px",
        // Typography
        fontFamily: "'Noto Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        lineHeight: 1.6,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        // Color
        ...colorStyle,
      }}
    >
      {label}
    </span>
  );
}