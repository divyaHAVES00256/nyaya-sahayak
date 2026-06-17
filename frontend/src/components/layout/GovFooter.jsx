// src/components/layout/GovFooter.jsx
// Official footer — ministry attribution on left, NIC credit on right.
// In normal document flow (not fixed) — sits below main content.

export default function GovFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        backgroundColor: "#003580",
        color: "#ffffff",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
        // Approximate height: 56px — keep in sync with PageShell min-height calc
        minHeight: "56px",
        flexShrink: 0,
      }}
    >
      {/* Left: Ministry attribution */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: "12px",
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.5,
        }}
      >
        © {currentYear} Ministry of Law and Justice, Government of India
      </p>

      {/* Right: NIC credit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: "12px",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <span>Designed &amp; Developed by</span>

        {/* NIC logotype — text-based, no external image dependency */}
        <span
          aria-label="NIC — National Informatics Centre"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#C8960C",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.06em",
            padding: "2px 7px",
            borderRadius: "3px",
            lineHeight: 1.6,
          }}
        >
          NIC
        </span>
      </div>
    </footer>
  );
}