export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#185FA5] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}