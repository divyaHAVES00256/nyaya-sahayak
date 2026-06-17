// src/components/ui/GovBadge.jsx
// Reusable pill badge — status labels, category tags, availability indicators.
// Colors: blue | saffron | green | gold | grey
// Intentionally tiny and self-contained — no external dependencies.

const COLOR_MAP = {
  blue: {
    backgroundColor: "#E8EEF7",
    color: "#003580",
    border: "1px solid #B8C8E0",
  },
  saffron: {
    backgroundColor: "#FFF0E6",
    color: "#CC4E00",
    border: "1px solid #FFD0AA",
  },
  green: {
    backgroundColor: "#E6F4ED",
    color: "#046A38",
    border: "1px solid #A8D5BC",
  },
  gold: {
    backgroundColor: "#FDF5E0",
    color: "#8B6508",
    border: "1px solid #EDD98A",
  },
  grey: {
    backgroundColor: "#F1F4F8",
    color: "#4A5568",
    border: "1px solid #D0D7E2",
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