// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import useAccessibilityStore from "./store/accessibilityStore";
import SkipToContent from "./components/accessibility/SkipToContent";
import AccessibilityToolbar from "./components/accessibility/AccessibilityToolbar";
import Dashboard from "./pages/Dashboard";
import LegalAidPage from "./pages/LegalAid";
import HelpPage from "./pages/HelpPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ChatPage from "./pages/ChatPage";

const fontSizeClassMap = {
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
};

function AppContent() {
  const { fontSize, highContrast } = useAccessibilityStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: "assistant", text: "Hello! I am Nyaya Sahayak. How can I help you today?" },
    { id: 2, role: "user", text: "I need help with divorce paperwork and local legal aid." },
    { id: 3, role: "assistant", text: "You can start by checking the local legal aid office and preparing proof of residence, identity, and marriage documents." },
  ]);

  const activeTab = location.pathname.startsWith("/legal-aid")
    ? "legal"
    : location.pathname.startsWith("/documents")
      ? "documents"
      : location.pathname.startsWith("/help")
        ? "help"
        : "home";

  const handleTabChange = (tabId) => {
    const targetMap = {
      home: "/",
      legal: "/legal-aid",
      documents: "/documents",
      help: "/help",
    };
    navigate(targetMap[tabId] || "/");
  };

  const handleStartChat = () => {
    navigate("/chat");
  };

  const addChatMessage = (message) => {
    setChatHistory((prev) => [...prev, { ...message, id: prev.length + 1 }]);
  };

  useEffect(() => {
    const body = document.body;
    body.classList.remove("text-base", "text-lg", "text-xl");
    body.classList.add(fontSizeClassMap[fontSize] || "text-base");
  }, [fontSize]);

  useEffect(() => {
    const body = document.body;
    if (highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  return (
    <>
      <SkipToContent />
      <AccessibilityToolbar />
      <Routes>
        <Route path="/" element={<Dashboard activeTab={activeTab} onTabChange={handleTabChange} onStartChat={handleStartChat} />} />
        <Route path="/legal-aid" element={<LegalAidPage activeTab={activeTab} onTabChange={handleTabChange} />} />
        <Route path="/documents" element={<PlaceholderPage title="Documents" subtitle="Official forms and downloadable guides will appear here soon." activeTab={activeTab} onTabChange={handleTabChange} />} />
        <Route path="/help" element={<HelpPage activeTab={activeTab} onTabChange={handleTabChange} />} />
        <Route path="/chat" element={<ChatPage activeTab={activeTab} onTabChange={handleTabChange} chatHistory={chatHistory} onSendMessage={addChatMessage} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}