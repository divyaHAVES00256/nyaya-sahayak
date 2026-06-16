export default function GovFooter() {
  return (
    <footer className="bg-[#003580] text-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-xs text-white/80 text-center sm:text-left">
        © 2025 Ministry of Law and Justice, Government of India
      </p>
      <p className="text-xs text-white/80 text-center sm:text-right">
        Designed &amp; Developed by{" "}
        <span className="font-semibold text-white">NIC</span>
        {" "}— National Informatics Centre
      </p>
    </footer>
  );
}