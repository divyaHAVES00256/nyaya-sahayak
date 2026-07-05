// src/pages/Dashboard/index.jsx
import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import PageShell from "../../components/layout/PageShell";
import GovCard from "../../components/ui/GovCard";
import HeroBanner from "./HeroBanner";
import StatsTicker from "./StatsTicker";
import LegalTopicsGrid from "./LegalTopicsGrid";
import HowItWorks from "./HowItWorks";
import TrustBar from "./TrustBar";
import { useTTS } from "../../hooks/useTTS";

export default function Dashboard({ activeTab, onTabChange, onStartChat }) {
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
    <PageShell showSidebar={true} activeTab={activeTab} onTabChange={onTabChange}>
      {({ setActiveTopic }) => (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <HeroBanner
            onBrowseTopics={() =>
              document.getElementById("legal-topics")?.scrollIntoView({ behavior: "smooth" })
            }
            onStartChat={onStartChat}
          />
          <StatsTicker />

          <GovCard
            title="Chat with Nyaya Sahayak"
            subtitle="Ask a legal question or get guided support in simple language"
            icon={MessageSquare}
            accentColor="#FFC107"
            style={{ marginTop: "24px" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  fontFamily: "'Noto Sans', sans-serif",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    alignSelf: "start",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    color: "var(--navy)",
                    borderRadius: "12px 12px 12px 0",
                    padding: "12px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    maxWidth: "80%",
                  }}
                >
                  Hello! I am Nyaya Sahayak. How can I help you today?
                </div>

                <div
                  style={{
                    alignSelf: "end",
                    backgroundColor: "rgba(21, 101, 192, 0.08)",
                    color: "var(--navy)",
                    borderRadius: "12px 12px 0 12px",
                    padding: "12px 14px",
                    maxWidth: "75%",
                  }}
                >
                  I need help with divorce paperwork and local legal aid.
                </div>

                <div
                  style={{
                    alignSelf: "start",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    color: "var(--navy)",
                    borderRadius: "12px 12px 12px 0",
                    padding: "12px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    maxWidth: "85%",
                  }}
                >
                  You can start by checking the local legal aid office and preparing proof of residence, identity, and marriage documents.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <input
                  type="text"
                  aria-label="Type a message to Nyaya Sahayak"
                  placeholder="Type your message here..."
                  style={{
                    flex: 1,
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--navy)",
                    border: "none",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </GovCard>

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