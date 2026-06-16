export default function GovBadge({ label, color = "blue" }) {
  const colorMap = {
    blue: "bg-[#E8EEF7] text-[#003580] border-[#B8C8E0]",
    saffron: "bg-[#FFF0E6] text-[#CC4E00] border-[#FFD0AA]",
    green: "bg-[#E6F4ED] text-[#046A38] border-[#A8D5BC]",
    gold: "bg-[#FDF5E0] text-[#8B6508] border-[#EDD98A]",
    grey: "bg-[#F1F4F8] text-[#4A5568] border-[#D0D7E2]",
  };

  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        colorMap[color] || colorMap.blue,
      ].join(" ")}
    >
      {label}
    </span>
  );
}