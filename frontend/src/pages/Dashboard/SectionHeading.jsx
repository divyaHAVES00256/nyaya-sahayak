// src/pages/Dashboard/SectionHeading.jsx
// Shared saffron-bar + Devanagari heading pattern used across dashboard sections

export default function SectionHeading({ id, titleDeva, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        aria-hidden="true"
        style={{
          width:        32,
          height:       3,
          background:   "var(--saffron)",
          marginBottom: 8,
          transition:   "background 0.25s ease",
        }}
      />
      <h2
        id={id}
        style={{
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
          fontSize:   22,
          fontWeight: 700,
          color:      "var(--navy)",
          margin:     0,
          lineHeight: 1.2,
          transition: "color 0.25s ease",
        }}
      >
        {titleDeva}
      </h2>
      <p
        style={{
          fontSize:   13,
          color:      "var(--text-secondary)",
          fontWeight: 400,
          margin:     "4px 0 0",
          transition: "color 0.25s ease",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}