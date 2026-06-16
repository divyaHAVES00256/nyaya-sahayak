import { useState } from "react";
import GovHeader from "./GovHeader";
import Sidebar from "./Sidebar";
import GovFooter from "./GovFooter";

export default function PageShell({ children }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeTopic, setActiveTopic] = useState("rti");

  return (
    <div
      className="min-h-screen bg-[#F1F4F8]"
      style={{ "--header-height": "120px" }}
    >
      {/* Fixed header */}
      <GovHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Below-header layout */}
      <div className="flex" style={{ paddingTop: "120px" }}>
        {/* Fixed sidebar */}
        <Sidebar activeTopic={activeTopic} onTopicChange={setActiveTopic} />

        {/* Main content area */}
        <div
          className="flex-1 flex flex-col min-h-screen"
          style={{ marginLeft: "260px" }}
        >
          <main
            id="main-content"
            className="flex-1 p-6"
            tabIndex={-1}
          >
            {typeof children === "function"
              ? children({ activeTopic, setActiveTopic })
              : children}
          </main>
          <GovFooter />
        </div>
      </div>
    </div>
  );
}