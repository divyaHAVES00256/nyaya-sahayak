import { Building2, FileCheck, Scale, Shield } from "lucide-react";

const TRUST_ITEMS = [
  { Icon: Building2, label: "NIC",        bg: "var(--navy-light)",  border: "var(--navy-border)",    color: "var(--navy)"    },
  { Icon: FileCheck, label: "DigiLocker", bg: "var(--green-light)", border: "var(--green-border)",   color: "var(--green)"   },
  { Icon: Scale,     label: "NALSA",      bg: "var(--gold-light)",  border: "var(--gold-border)",    color: "var(--gold)"    },
  { Icon: Shield,    label: "RTI Online", bg: "var(--saffron-light)",border: "var(--saffron-border)", color: "var(--saffron)" },
];

export default function TrustBar() {
  return (
    <div
      id="trust-bar"
      role="complementary"
      aria-label="Trusted Government of India systems powering Nyaya Sahayak"
      style={{
        background:     "var(--bg-surface)",
        border:         "1px solid var(--border)",
        borderRadius:   10,
        padding:        "16px 24px",
        marginTop:      24,
        marginBottom:   8,
        boxShadow:      "var(--shadow-card)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        flexWrap:       "wrap",
        gap:            16,
        fontFamily:     "'Noto Sans', sans-serif",
        transition:     "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* Left label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", transition: "color 0.25s ease" }}>
          Powered by
        </span>
        <span style={{ fontSize: 12, color: "var(--navy)", fontWeight: 500, transition: "color 0.25s ease" }}>
          trusted Government of India systems
        </span>
      </div>

      {/* Logo items */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        {TRUST_ITEMS.map(({ Icon, label, bg, border, color }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   8,
                background:     bg,
                border:         `1px solid ${border}`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                transition:     "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              <Icon size={18} aria-hidden="true" style={{ color, transition: "color 0.25s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", transition: "color 0.25s ease" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Beta badge */}
      <span
        aria-label="Version 1.0 Beta — Share Feedback"
        style={{
          background:   "var(--saffron-light)",
          border:       "1px solid var(--saffron-border)",
          color:        "var(--saffron)",
          borderRadius: 999,
          padding:      "4px 12px",
          fontSize:     11,
          fontWeight:   500,
          whiteSpace:   "nowrap",
          transition:   "background 0.25s ease, color 0.25s ease",
        }}
      >
        v1.0 Beta &bull; Share Feedback
      </span>
    </div>
  );
}