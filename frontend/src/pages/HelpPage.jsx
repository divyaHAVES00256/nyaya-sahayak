import PageShell from "../components/layout/PageShell";
import GovCard from "../components/ui/GovCard";
import GovButton from "../components/ui/GovButton";
import { LifeBuoy, PhoneCall, MessageCircle, FileText, ShieldCheck, ChevronRight, Globe2, UserCheck, ClipboardCheck, BookOpen, Phone, Banknote, Scroll } from "lucide-react";

const supportItems = [
  {
    title: "Emergency helpline",
    subtitle: "24x7 national assistance",
    text: "Call the national legal services helpline for urgent help, official advice, and direction to the nearest support centre.",
    action: "Call 1516",
    icon: PhoneCall,
    accent: "#0b3d91",
  },
  {
    title: "Live assistance",
    subtitle: "Speak with a volunteer",
    text: "Get live chat help for common questions about legal rights, documents, and service access.",
    action: "Start chat",
    icon: MessageCircle,
    accent: "#d97706",
  },
  {
    title: "Official guidance",
    subtitle: "Forms and templates",
    text: "Download trusted step-by-step guides for RTI, complaints, notices, and other citizen services.",
    action: "Open library",
    icon: FileText,
    accent: "#0f766e",
  },
  {
    title: "Accessibility support",
    subtitle: "For women, seniors & more",
    text: "Find audio-friendly guidance, large-print notes, and special advice for vulnerable citizens.",
    action: "Learn more",
    icon: Globe2,
    accent: "#0f5478",
  },
];

const emergencyNumbers = [
  {
    title: "Legal services helpline",
    value: "1516",
    note: "All-citizen legal support",
    icon: Phone,
  },
  {
    title: "Women & child helpline",
    value: "1091",
    note: "Immediate safety and protection",
    icon: LifeBuoy,
  },
  {
    title: "Disability helpline",
    value: "1800-123-4567",
    note: "Support for disability rights",
    icon: Globe2,
  },
  {
    title: "Senior citizen helpline",
    value: "14567",
    note: "Elder care and pension help",
    icon: UserCheck,
  },
];

const lawAlerts = [
  {
    title: "Protection of Women from Domestic Violence Act, 2005",
    description: "Provides protection orders, shelter homes, and legal aid for women facing abuse.",
    icon: Scroll,
  },
  {
    title: "Rights of Persons with Disabilities Act, 2016",
    description: "Ensures access, equality, and support services for persons with disabilities.",
    icon: Banknote,
  },
  {
    title: "Maintenance and Welfare of Parents and Senior Citizens Act, 2007",
    description: "Protects senior citizens' rights and enables claims for maintenance and care.",
    icon: BookOpen,
  },
  {
    title: "Indian Penal Code, Section 498A",
    description: "Offers legal protection against cruelty by husband or relatives, including dowry-related offences.",
    icon: ShieldCheck,
  },
  {
    title: "Right to Information Act, 2005",
    description: "Enables citizens to seek information from public authorities and promotes government transparency.",
    icon: Globe2,
  },
  {
    title: "National Food Security Act, 2013",
    description: "Provides subsidised food grains to eligible households and helps protect vulnerable citizens.",
    icon: Banknote,
  },
  {
    title: "Protection of Children from Sexual Offences Act, 2012",
    description: "Strengthens care and protection for children and ensures speedy justice in sexual abuse cases.",
    icon: ShieldCheck,
  },
];

const faqItems = [
  {
    question: "How can I request legal assistance?",
    answer: "Choose the relevant service category and use the legal aid or document support options available on the portal.",
  },
  {
    question: "Is support available in multiple languages?",
    answer: "Yes. Help is available in Hindi, English, and Hinglish for easier access.",
  },
  {
    question: "Can I upload documents for review?",
    answer: "Yes. The Documents section allows you to upload files securely for official guidance and processing.",
  },
  {
    question: "Where can I find helpline numbers for special support?",
    answer: "Use the helpline section on this page for urgent support and the accessibility card for women, seniors, and disability-related help.",
  },
];

export default function HelpPage({ activeTab, onTabChange }) {
  return (
    <PageShell showSidebar={false} activeTab={activeTab} onTabChange={onTabChange}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 24, padding: "0 8px" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #0b3d91 0%, #145f97 45%, #0f4f76 100%)",
            borderRadius: 24,
            padding: 32,
            color: "#fff",
            boxShadow: "0 24px 56px rgba(11, 61, 145, 0.18)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 18 }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LifeBuoy size={24} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>Help & Support</div>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: "10px 0 10px", lineHeight: 1.1 }}>Official support, clear guidance, emergency numbers.</h1>
              <p style={{ maxWidth: 760, fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.9)" }}>
                Get fast access to legal helplines, live assistance, document support, and laws that protect citizens. This page is your government-style support dashboard.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
            {supportItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} style={{ padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{item.subtitle}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.75, color: "rgba(255,255,255,0.88)" }}>{item.text}</p>
                  <GovButton variant="secondary" size="sm" icon={ChevronRight} style={{ marginTop: 14 }}>{item.action}</GovButton>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr 1fr" }}>
          <GovCard title="Important legal numbers" subtitle="Helplines you should know" icon={Phone} accentColor="#0b3d91">
            <div style={{ display: "grid", gap: 12 }}>
              {emergencyNumbers.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ display: "grid", gap: 8, padding: 16, borderRadius: 14, background: "var(--bg-surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--navy-light)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.note}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>{item.value}</div>
                  </div>
                );
              })}
            </div>
          </GovCard>

          <GovCard title="Common important laws" subtitle="Know your rights" icon={Scroll} accentColor="#0f766e">
            <div style={{ display: "grid", gap: 12 }}>
              {lawAlerts.map((law) => (
                <details key={law.title} style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-surface-2)", padding: 14 }}>
                  <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontWeight: 700, color: "var(--text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <law.icon size={16} />
                      <span>{law.title}</span>
                    </span>
                    <span>📌</span>
                  </summary>
                  <div style={{ marginTop: 10, color: "var(--text-secondary)", lineHeight: 1.7 }}>{law.description}</div>
                </details>
              ))}
            </div>
          </GovCard>
        </div>

        <GovCard title="How this page works" subtitle="Your dashboard-style help centre" icon={ShieldCheck} accentColor="#0b3d91">
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>🛡️</span>
              <div>
                <div style={{ fontWeight: 700 }}>Start with a helpline or chat</div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>Choose the service that matches your request: urgent help, document guidance, or accessibility support.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div>
                <div style={{ fontWeight: 700 }}>Keep key documents nearby</div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>Aadhaar, proof of address, medical reports, and complaint notes are helpful to share.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700 }}>Use laws as your guide</div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>See the key acts below and mention them if you need legal protection or support.</div>
              </div>
            </div>
          </div>
        </GovCard>

        <GovCard title="Frequently asked questions" subtitle="Citizen support answers" icon={ShieldCheck} accentColor="#0f766e">
          <div style={{ display: "grid", gap: 12 }}>
            {faqItems.map((item) => (
              <div key={item.question} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 16, background: "var(--bg-surface-2)" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{item.question}</div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14 }}>{item.answer}</div>
              </div>
            ))}
          </div>
        </GovCard>
      </div>
    </PageShell>
  );
}
