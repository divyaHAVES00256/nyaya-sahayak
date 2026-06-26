// src/pages/Dashboard/index.jsx
import { useEffect } from "react";
import PageShell from "../../components/layout/PageShell";
import HeroBanner from "./HeroBanner";
import StatsTicker from "./StatsTicker";
import LegalTopicsGrid from "./LegalTopicsGrid";
import HowItWorks from "./HowItWorks";
import TrustBar from "./TrustBar";
import { useTTS } from "../../hooks/useTTS";

export default function Dashboard() {
  const { speak } = useTTS();

  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        "Namaste. Nyaya Sahayak dashboard has loaded. " +
          "8 legal topics are available. " +
          "Press Tab to navigate or use the Start Chat button to begin."
      );
    }, 800);
    return () => clearTimeout(t);
  }, [speak]);

  return (
    // Note: showSidebar={false} if you want the dashboard full-width like a landing page
    <PageShell showSidebar={true}>
      {({ setActiveTopic }) => (
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="nyaya-dashboard">
          <HeroBanner
            onBrowseTopics={() => {
              document.getElementById("legal-topics")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <StatsTicker />
          <LegalTopicsGrid
            onTopicSelect={(topic) => {
              setActiveTopic(topic.id);
              speak(`${topic.labelEnglish} legal guide selected. Loading information.`);
            }}
          />
          <HowItWorks />
          <TrustBar />
        </div>
      )}
    </PageShell>
  );
}