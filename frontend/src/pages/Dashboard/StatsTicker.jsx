import { useEffect, useState } from "react";

export default function StatsTicker() {
  const [domains, setDomains] = useState(0);
  const [langs, setLangs] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    const raf = requestAnimationFrame(function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setDomains(Math.round(eased * 8));
      setLangs(Math.round(eased * 22));
      if (progress < 1) requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  const stats = [
    { value: domains,  suffix: "",   label: "Legal Domains Covered",    static: false },
    { value: "1516",   suffix: "",   label: "NALSA Helpline Number",      static: true  },
    { value: langs,    suffix: "+",  label: "Indian Languages Supported", static: false },
    { value: "100%",   suffix: "",   label: "Free \u2022 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915", static: true  },
  ];

  return (
    <div
      id="stats-section"
      style={{
        background: "white",
        borderTop: "3px solid #FF6200",
        border: "1px solid #D0D7E2",
        borderTopWidth: 3,
        borderTopColor: "#FF6200",
        borderRadius: 8,
        padding: "12px 24px",
        marginTop: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{ display: "flex", alignItems: "stretch" }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4px 16px",
              position: "relative",
              borderLeft: i > 0 ? "1px solid #D0D7E2" : "none",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 22,
                fontWeight: 700,
                color: "#003580",
                lineHeight: 1.2,
                fontFamily: "'Noto Sans', sans-serif",
              }}
            >
              {stat.static ? stat.value : `${stat.value}${stat.suffix}`}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 11,
                color: "#718096",
                marginTop: 3,
                lineHeight: 1.4,
                fontFamily: "'Noto Sans', sans-serif",
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