export default function GovCard({
  title,
  subtitle,
  children,
  icon: Icon,
  accentColor,
  onClick,
  className = "",
}) {
  const isClickable = typeof onClick === "function";

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        "bg-white rounded-lg border border-[#D0D7E2] shadow-sm overflow-hidden",
        accentColor ? "border-l-4" : "",
        isClickable
          ? "cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#003580] focus:ring-offset-2"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      {(title || Icon) && (
        <div className="flex items-start gap-3 p-4 pb-2">
          {Icon && (
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: accentColor ? `${accentColor}18` : "#E8EEF7",
              }}
            >
              <Icon
                size={18}
                aria-hidden="true"
                style={{ color: accentColor || "#003580" }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-base font-semibold text-[#0D0D0D] leading-snug">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-[#718096] mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}