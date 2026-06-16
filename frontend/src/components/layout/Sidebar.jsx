import { useState } from "react";
import {
  FileText,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
  Phone,
} from "lucide-react";
import { LEGAL_TOPICS } from "../../constants/legalTopics";
import { useTTS } from "../../hooks/useTTS";

const iconMap = {
  FileText,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
};

export default function Sidebar({ activeTopic, onTopicChange }) {
  const { speak } = useTTS();

  const handleTopicClick = (topic) => {
    onTopicChange?.(topic.id);
    speak(topic.labelEnglish + " selected");
  };

  const handleHelpline = () => {
    speak(
      "National Legal Services helpline number is 1516. This is a toll free number available 24 hours."
    );
  };

  return (
    <aside
      aria-label="Legal topics navigation"
      className="fixed left-0 bg-white border-r border-[#D0D7E2] overflow-y-auto flex flex-col"
      style={{
        top: "var(--header-height, 120px)",
        width: "260px",
        height: "calc(100vh - var(--header-height, 120px))",
      }}
    >
      {/* Section label */}
      <div
        className="px-4 pt-4 pb-2 text-[#718096] uppercase tracking-wider"
        style={{ fontSize: "11px" }}
      >
        कानूनी विषय / Legal Topics
      </div>

      {/* Topic list */}
      <nav role="menu" aria-label="Legal topic categories">
        {LEGAL_TOPICS.map((topic) => {
          const Icon = iconMap[topic.icon];
          const isActive = activeTopic === topic.id;

          return (
            <button
              key={topic.id}
              role="menuitem"
              aria-label={`${topic.labelEnglish} - ${topic.act}`}
              onClick={() => handleTopicClick(topic)}
              className={[
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#003580]",
                isActive
                  ? "bg-[#FFF5EF] text-[#003580] border-l-[3px] border-[#FF6200]"
                  : "text-[#0D0D0D] hover:bg-[#F1F4F8] border-l-[3px] border-transparent",
              ].join(" ")}
            >
              {Icon && (
                <Icon
                  size={20}
                  aria-hidden="true"
                  style={{ color: isActive ? topic.color : topic.color, flexShrink: 0 }}
                />
              )}
              <div className="min-w-0">
                <div
                  className="devanagari font-medium leading-snug truncate"
                  style={{ fontSize: "14px" }}
                >
                  {topic.labelHindi}
                </div>
                <div
                  className="text-[#718096] leading-snug truncate"
                  style={{ fontSize: "11px" }}
                >
                  {topic.labelEnglish}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-[#D0D7E2] mx-4 my-2" />

      {/* Helpline card */}
      <div className="mx-3 mb-3">
        <button
          onClick={handleHelpline}
          className="w-full bg-[#003580] text-white rounded-lg p-3 text-left cursor-pointer hover:bg-[#002460] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#003580]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Phone size={14} aria-hidden="true" className="opacity-80" />
            <span className="devanagari text-xs opacity-90">
              राष्ट्रीय विधिक सेवा
            </span>
          </div>
          <div className="text-2xl font-bold tracking-wide">1516</div>
          <div className="text-xs opacity-70 mt-0.5">Toll Free • 24x7</div>
        </button>
      </div>

      {/* Version tag */}
      <div
        className="text-center text-[#718096] pb-3 mt-auto"
        style={{ fontSize: "10px" }}
      >
        v1.0 Beta • NIC
      </div>
    </aside>
  );
}