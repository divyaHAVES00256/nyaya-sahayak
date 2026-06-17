// src/components/ui/GovCard.jsx
// Reusable card — white surface with optional accent left border, icon+title header,
// subtitle, badge slot, and optional click interactivity.
// Used by Dashboard stats row, legal topic grid, and future phase pages.

export default function GovCard({
  title,
  subtitle,
  children,
  icon: Icon,
  accentColor,       // hex string — drives the left border color
  onClick,           // if passed: card becomes interactive (cursor-pointer + hover shadow)
  badge,             // ReactNode — rendered in top-right of header (e.g. <GovBadge />)
  style: extraStyle, // escape hatch for layout overrides (width, height, etc.)
  ariaLabel,
}) {
  const isInteractive = typeof onClick === "function";

  function handleKeyDown(e) {
    // Allow Enter / Space to trigger click for keyboard users
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  }

  function handleFocus(e) {
    e.currentTarget.style.outline = "2px solid #003580";
    e.currentTarget.style.outlineOffset = "2px";
  }

  function handleBlur(e) {
    e.currentTarget.style.outline = "none";
    e.currentTarget.style.outlineOffset = "0";
    // Restore base shadow
    e.currentTarget.style.boxShadow = BASE_SHADOW;
  }

  function handleMouseEnter(e) {
    if (!isInteractive) return;
    e.currentTarget.style.boxShadow = HOVER_SHADOW;
  }

  function handleMouseLeave(e) {
    if (!isInteractive) return;
    e.currentTarget.style.boxShadow = BASE_SHADOW;
  }

  const cardStyle = {
    // Surface
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: BASE_SHADOW,
    // Borders — left accent overrides the uniform border on that side
    border: "1px solid #D0D7E2",
    borderLeft: accentColor ? `4px solid ${accentColor}` : "1px solid #D0D7E2",
    // Layout
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    // Interactivity
    cursor: isInteractive ? "pointer" : "default",
    transition: "box-shadow 0.15s, border-color 0.15s",
    outline: "none",
    // Caller overrides
    ...extraStyle,
  };

  // Use <article> for semantic richness when the card has a title (landmark);
  // fall back to <div> for pure layout cards without a heading.
  const Tag = title ? "article" : "div";

  return (
    <Tag
      style={cardStyle}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={isInteractive ? handleFocus : undefined}
      onBlur={isInteractive ? handleBlur : undefined}
      // Only interactive cards should be in tab order
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? "button" : undefined}
      aria-label={ariaLabel ?? (isInteractive ? title : undefined)}
    >
      {/* ── Card header — icon + title + subtitle + badge ── */}
      {(Icon || title || subtitle || badge) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            padding: "16px 16px 0 16px",
          }}
        >
          {/* Left: icon + text stack */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: 0, // allow text truncation inside flex child
              flex: 1,
            }}
          >
            {/* Icon bubble */}
            {Icon && (
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: accentColor
                    ? hexToAlpha(accentColor, 0.1)
                    : "#F1F4F8",
                  color: accentColor ?? "#003580",
                }}
              >
                <Icon size={20} />
              </span>
            )}

            {/* Title + subtitle */}
            {(title || subtitle) && (
              <div style={{ minWidth: 0 }}>
                {title && (
                  <div
                    style={{
                      fontFamily: "'Noto Sans', sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0D0D0D",
                      lineHeight: 1.3,
                      // Support Devanagari titles without a separate class
                      // (Noto Sans Devanagari is loaded globally)
                    }}
                  >
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div
                    style={{
                      fontFamily: "'Noto Sans', sans-serif",
                      fontSize: "12px",
                      color: "#718096",
                      lineHeight: 1.4,
                      marginTop: "2px",
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: badge slot */}
          {badge && (
            <div style={{ flexShrink: 0, marginTop: "2px" }}>{badge}</div>
          )}
        </div>
      )}

      {/* ── Card body — arbitrary children ── */}
      {children && (
        <div
          style={{
            padding: "12px 16px 16px 16px",
            flex: 1,
            fontFamily: "'Noto Sans', sans-serif",
            fontSize: "14px",
            color: "#4A5568",
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      )}
    </Tag>
  );
}

// ── Helpers ──

const BASE_SHADOW = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
const HOVER_SHADOW = "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)";

/**
 * Convert a hex color + alpha to a CSS rgba() string.
 * Used for the icon bubble background (tinted version of the accent color).
 * Handles both #RRGGBB and #RGB formats.
 */
function hexToAlpha(hex, alpha) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#F1F4F8"; // safe fallback
  return `rgba(${r},${g},${b},${alpha})`;
}