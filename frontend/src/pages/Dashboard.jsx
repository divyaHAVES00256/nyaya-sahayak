import { useEffect } from "react";
import {
  Scale,
  FileText,
  Phone,
  Mic,
  ArrowRight,
  FileText as FileTextIcon,
  Home,
  ShoppingBag,
  Heart,
  Briefcase,
  Accessibility,
  Building,
  Shield,
} from "lucide-react";
import PageShell from "../components/layout/PageShell";
import GovCard from "../components/ui/GovCard";
import GovBadge from "../components/ui/GovBadge";
import GovButton from "../components/ui/GovButton";
import { LEGAL_TOPICS } from "../constants/legalTopics";
import { useTTS } from "../hooks/useTTS";

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

const topicBadgeColor = {
  "#003580": "blue",
  "#046A38": "green",
  "#FF6200": "saffron",
  "#C8960C": "gold",
  "#4A5568": "grey",
};

const HOW_TO_STEPS = [
  {
    number: 1,
    icon: Mic,
    title: "Speak or Type",
    description: "Ask your question in Hindi, English, or Hinglish",
  },
  {
    number: 2,
    icon: Scale,
    title: "Get Guidance",
    description: "Receive plain-language legal information instantly",
  },
  {
    number: 3,
    icon: FileTextIcon,
    title: "Act on It",
    description: "Download documents or get referrals to legal aid",
  },
];

export default function Dashboard() {
  const { speak } = useTTS();

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(
        "Namaste! Nyaya Sahayak is ready. Press Tab to navigate or say your legal question."
      );
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageShell>
      {({ activeTopic, setActiveTopic }) => (
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Welcome Banner */}
          <div className="bg-[#003580] text-white rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h1 className="devanagari text-2xl font-bold mb-1">
                  नमस्ते! <span className="font-normal text-white/80">/ Namaste!</span>
                </h1>
                <p className="text-white/85 text-sm leading-relaxed max-w-xl">
                  Nyaya Sahayak is ready to assist you with legal queries in
                  Hindi, English, or Hinglish. Select a topic from the sidebar
                  or start a conversation below.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-white text-[#003580] font-semibold px-5 py-2 rounded text-sm flex items-center gap-2 hover:bg-[#F1F4F8] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#003580]"
                onClick={() => speak("Starting legal chat. Please type or speak your question.")}
              >
                Start Legal Chat
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                className="text-white border border-white/50 px-5 py-2 rounded text-sm hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#003580]"
                onClick={() => {
                  document.getElementById("legal-topics-section")?.scrollIntoView({ behavior: "smooth" });
                  speak("Browse legal topics below.");
                }}
              >
                Browse Topics
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GovCard
              title="8 Legal Domains"
              subtitle="Comprehensive legal aid coverage"
              icon={Scale}
              accentColor="#003580"
            >
              <div className="pt-1">
                <GovBadge label="Active" color="blue" />
              </div>
            </GovCard>

            <GovCard
              title="RTI Filing Guide"
              subtitle="Step-by-step RTI application help"
              icon={FileText}
              accentColor="#FF6200"
            >
              <div className="pt-1">
                <GovBadge label="Most Used" color="saffron" />
              </div>
            </GovCard>

            <GovCard
              title="Helpline 1516"
              subtitle="National Legal Services Authority"
              icon={Phone}
              accentColor="#046A38"
            >
              <div className="pt-1">
                <GovBadge label="24x7" color="green" />
              </div>
            </GovCard>
          </div>

          {/* Legal Topics grid */}
          <section id="legal-topics-section" aria-labelledby="topics-heading">
            <h2
              id="topics-heading"
              className="text-[#0D0D0D] font-semibold text-base mb-4"
            >
              कानूनी विषय /{" "}
              <span className="text-[#4A5568] font-normal">Legal Topics</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {LEGAL_TOPICS.map((topic) => {
                const Icon = iconMap[topic.icon];
                const badgeColor = topicBadgeColor[topic.color] || "grey";
                const isActive = activeTopic === topic.id;

                return (
                  <GovCard
                    key={topic.id}
                    title={topic.labelHindi}
                    subtitle={topic.act}
                    icon={Icon}
                    accentColor={topic.color}
                    onClick={() => {
                      setActiveTopic(topic.id);
                      speak(topic.labelEnglish + " selected");
                    }}
                    className={isActive ? "ring-2 ring-[#FF6200]" : ""}
                  >
                    <div className="pt-1 flex flex-wrap gap-1">
                      <GovBadge label={topic.labelEnglish} color={badgeColor} />
                    </div>
                  </GovCard>
                );
              })}
            </div>
          </section>

          {/* How to Use */}
          <section aria-labelledby="how-heading">
            <h2
              id="how-heading"
              className="text-[#0D0D0D] font-semibold text-base mb-4"
            >
              How to Use Nyaya Sahayak
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {HOW_TO_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex-1 bg-white rounded-lg border border-[#D0D7E2] p-5 flex flex-col items-start gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-full bg-[#FF6200] text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                        aria-hidden="true"
                      >
                        {step.number}
                      </span>
                      <Icon
                        size={20}
                        aria-hidden="true"
                        className="text-[#003580]"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0D0D0D]">
                        {step.title}
                      </p>
                      <p className="text-xs text-[#4A5568] mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}
    </PageShell>
  );
}