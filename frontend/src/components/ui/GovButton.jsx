export default function GovButton({
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  onClick,
  ariaLabel,
  disabled = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const iconSize = { sm: 14, md: 16, lg: 18 };

  const variantClasses = {
    primary:
      "bg-[#003580] text-white border border-[#003580] hover:bg-[#002460] hover:border-[#002460]",
    secondary:
      "bg-white text-[#003580] border border-[#003580] hover:bg-[#F1F4F8]",
    ghost:
      "bg-transparent text-[#003580] border border-transparent hover:bg-[#F1F4F8]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-medium rounded transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#003580] focus:ring-offset-2",
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Icon && <Icon size={iconSize[size] || 16} aria-hidden="true" />}
      {children}
    </button>
  );
}