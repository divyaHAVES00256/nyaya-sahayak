import { Building2, FileCheck, Scale, Shield } from "lucide-react";

export default function TrustBar() {
  const trustItems = [
    {
      Icon: Building2,
      label: "NIC",
      bg: "#E8EEF7",
      border: "#B8C8E0",
      color: "#003580",
    },
    {
      Icon: FileCheck,
      label: "DigiLocker",
      bg: "#E6F4ED",
      border: "#A8D5BC",
      color: "#046A38",
    },
    {
      Icon: Scale,
      label: "NALSA",
      bg: "#FDF5E0",
      border: "#EDD98A",
      color: "#8B6508",
    },
    {
      Icon: Shield,
      label: "RTI Online",
      bg: "#FFF0E6",
      border: "#FFD0AA",
      color: "#CC4E00",
    },
  ];

  return (
    <div
      id="trust-bar"
      role="complementary"
      aria-label="Trusted Government of India systems powering Nyaya Sahayak"
      style={{
        background: "white",
        border: "1px solid #D0D7E2",
        borderRadius: 10,
        padding: "16px 24px",
        marginTop: 24,
        marginBottom: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      {/* Left label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 11, color: "#718096" }}>Powered by</span>
        <span style={{ fontSize: 12, color: "#003580", fontWeight: 500 }}>
          trusted Government of India systems
        </span>
      </div>

      {/* Logo items */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {trustItems.map(({ Icon, label, bg, border, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: bg,
                border: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} aria-hidden="true" style={{ color }} />
            </div>
            <span style={{ fontSize: 10, color: "#4A5568", textAlign: "center" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Beta badge */}
      <span
        aria-label="Version 1.0 Beta — Share Feedback"
        style={{
          background: "#FFF0E6",
          border: "1px solid #FFD0AA",
          color: "#CC4E00",
          borderRadius: 999,
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        v1.0 Beta &bull; Share Feedback
      </span>
    </div>
  );
}