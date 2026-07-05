import { useEffect, useState } from "react";

const STATS = [
  { id: "domains",  target: 8,    suffix: "",   label: "Legal Domains Covered",     animate: true  },
  { id: "helpline", target: 1516, suffix: "",   label: "NALSA Helpline Number",      animate: false },
  { id: "langs",    target: 22,   suffix: "+",  label: "Indian Languages Supported", animate: true  },
  { id: "free",     target: 100,  suffix: "%",  label: "Free \u2022 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915", animate: false },
];

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatsTicker() {
  const [counts, setCounts] = useState({ domains: 0, helpline: 1516, langs: 0, free: 100 });

  useEffect(() => {
    const duration = 1500;
    const start    = performance.now();

    const raf = requestAnimationFrame(function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = easeOutCubic(progress);
      setCounts((prev) => ({
        ...prev,
        domains: Math.round(eased * 8),
        langs:   Math.round(eased * 22),
      }));
      if (progress < 1) requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  const displayValue = (stat) => {
    const raw = counts[stat.id];
    return `${raw}${stat.suffix}`;
  };

  return (
    <div
      id="stats-section"
      style={{
        background:      "var(--bg-surface)",
        borderTop:       "3px solid var(--saffron)",
        border:          "1px solid var(--border)",
        borderTopWidth:  3,
        borderTopColor:  "var(--saffron)",
        borderRadius:    8,
        padding:         "12px 24px",
        marginTop:       16,
        boxShadow:       "var(--shadow-card)",
        transition:      "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{ display: "flex", alignItems: "stretch" }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.id}
            style={{
              flex:         1,
              textAlign:    "center",
              padding:      "4px 16px",
              borderLeft:   i > 0 ? "1px solid var(--border)" : "none",
              transition:   "border-color 0.25s ease",
            }}
          >
            <span
              style={{
                display:    "block",
                fontSize:   22,
                fontWeight: 700,
                color:      "var(--navy)",
                lineHeight: 1.2,
                fontFamily: "'Noto Sans', sans-serif",
                transition: "color 0.25s ease",
              }}
            >
              {displayValue(stat)}
            </span>
            <span
              style={{
                display:    "block",
                fontSize:   11,
                color:      "var(--text-muted)",
                marginTop:  3,
                lineHeight: 1.4,
                fontFamily: "'Noto Sans', sans-serif",
                transition: "color 0.25s ease",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}