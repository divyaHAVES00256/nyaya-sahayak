// src/components/ui/GovButton.jsx
// Reusable button — the ONLY button primitive to use from Phase 2 onward.
// Variants: primary | secondary | ghost
// Sizes:    sm | md | lg
// Supports: lucide icon (left of label), disabled state, aria-label override

const VARIANT_STYLES = {
  primary: {
    base: {
      backgroundColor: "#003580",
      color: "#ffffff",
      border: "1px solid #003580",
    },
    hover: {
      backgroundColor: "#002460",
      borderColor: "#002460",
    },
    active: {
      backgroundColor: "#001840",
      borderColor: "#001840",
    },
  },
  secondary: {
    base: {
      backgroundColor: "#ffffff",
      color: "#003580",
      border: "1px solid #003580",
    },
    hover: {
      backgroundColor: "#F1F4F8",
      borderColor: "#003580",
    },
    active: {
      backgroundColor: "#E8EEF7",
      borderColor: "#002460",
    },
  },
  ghost: {
    base: {
      backgroundColor: "transparent",
      color: "#003580",
      border: "1px solid transparent",
    },
    hover: {
      backgroundColor: "#F1F4F8",
      borderColor: "transparent",
    },
    active: {
      backgroundColor: "#E8EEF7",
      borderColor: "transparent",
    },
  },
};

const SIZE_STYLES = {
  sm: {
    padding: "6px 12px",
    fontSize: "12px",
    iconSize: 14,
    gap: "6px",
    borderRadius: "4px",
  },
  md: {
    padding: "9px 18px",
    fontSize: "14px",
    iconSize: 16,
    gap: "8px",
    borderRadius: "6px",
  },
  lg: {
    padding: "12px 24px",
    fontSize: "15px",
    iconSize: 18,
    gap: "10px",
    borderRadius: "6px",
  },
};

export default function GovButton({
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  onClick,
  ariaLabel,
  disabled = false,
  type = "button",
  style: extraStyle,       // escape hatch for one-off overrides
  className,
}) {
  const v = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const s = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  // We manage hover/active via JS event handlers so the style stays in one
  // source of truth — no CSS class collisions with Tailwind or index.css.
  function handleMouseEnter(e) {
    if (disabled) return;
    Object.assign(e.currentTarget.style, v.hover);
  }
  function handleMouseLeave(e) {
    if (disabled) return;
    Object.assign(e.currentTarget.style, v.base);
  }
  function handleMouseDown(e) {
    if (disabled) return;
    Object.assign(e.currentTarget.style, v.active);
  }
  function handleMouseUp(e) {
    if (disabled) return;
    Object.assign(e.currentTarget.style, v.hover);
  }
  function handleFocus(e) {
    e.currentTarget.style.outline = "2px solid #003580";
    e.currentTarget.style.outlineOffset = "2px";
  }
  function handleBlur(e) {
    e.currentTarget.style.outline = "none";
    e.currentTarget.style.outlineOffset = "0";
    // Restore base style in case focus left mid-hover
    Object.assign(e.currentTarget.style, v.base);
  }

  const baseStyle = {
    // Layout
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: `${s.gap}`,
    // Sizing
    padding: s.padding,
    borderRadius: s.borderRadius,
    // Typography
    fontFamily: "'Noto Sans', sans-serif",
    fontSize: s.fontSize,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    // Interactivity
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    // Reset
    textDecoration: "none",
    outline: "none",
    transition: "background-color 0.15s, border-color 0.15s, opacity 0.15s",
    // Variant colours
    ...v.base,
    // Caller overrides (last, intentionally)
    ...extraStyle,
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Leading icon — sized per the size token */}
      {Icon && (
        <Icon
          size={s.iconSize}
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        />
      )}

      {/* Label */}
      {children && (
        <span>{children}</span>
      )}
    </button>
  );
}