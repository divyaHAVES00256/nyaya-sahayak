import { useEffect } from "react";
import { Accessibility, BadgeCheck, FileText, MessageCircle, PhoneCall, Scale, ShieldCheck, UserCheck, Star, FolderCheck } from "lucide-react";
import PageShell from "../components/layout/PageShell";
import GovButton from "../components/ui/GovButton";
import GovCard from "../components/ui/GovCard";
import { useTTS } from "../hooks/useTTS";

const serviceCards = [
  {
    title: "Free legal guidance",
    subtitle: "Help in Hindi, English, or Hinglish",
    text: "Receive plain-language advice for everyday legal questions, document drafting, and safe next steps.",
    icon: Scale,
    accent: "#0b3d91",
  },
  {
    title: "Emergency support",
    subtitle: "Quick helpline access",
    text: "Reach the national legal services helpline for urgent support and direction to the nearest aid centre.",
    icon: PhoneCall,
    accent: "#d97706",
  },
  {
    title: "Document assistance",
    subtitle: "Access ready-to-use forms",
    text: "Find guided templates for RTI applications, notices, complaints, and government forms.",
    icon: FileText,
    accent: "#0f766e",
  },
];

const accessibilitySupport = [
  {
    title: "Women and girls",
    text: "Confidential support for domestic violence, gender rights, and family law issues with a safe referral pathway.",
  },
  {
    title: "Adults aged 55+",
    text: "Help with pension claims, elder abuse protection, health entitlements, and access to senior citizen schemes.",
  },
  {
    title: "People with disabilities",
    text: "Guidance for disability certification, accessible scheme applications, and legal protection under the Rights of Persons with Disabilities Act.",
  },
  {
    title: "Visually impaired citizens",
    text: "Audio-friendly help, large-print guidance, and plain-language support for forms and submissions.",
  },
];

const faqItems = [
  {
    question: "What documents can I upload?",
    answer: "You can submit documents related to RTI, complaints, legal notices, and government service proofs.",
  },
  {
    question: "How quickly will I get help?",
    answer: "Our portal helps you connect to helpline and guidance resources immediately, and response times vary by service.",
  },
  {
    question: "Is my information secure?",
    answer: "Yes. This site uses secure submission channels and official guidance standards for all legal aid services.",
  },
  {
    question: "Can I get help in my local language?",
    answer: "Yes. We offer support in Hindi, English, Hinglish, and can connect you to local assistance services.",
  },
];

const howItWorks = [
  {
    label: "Step 1",
    text: "Select your issue from the main categories and tell us in simple words.",
  },
  {
    label: "Step 2",
    text: "Choose the right support channel: helpline, chat, or document assistance.",
  },
  {
    label: "Step 3",
    text: "Receive clear guidance, draft examples, and next-step advice.",
  },
];

export default function LegalAidPage({ activeTab, onTabChange }) {
  const { speak } = useTTS();

  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Legal aid services page loaded. You can access free guidance, emergency support, and document assistance here.");
    }, 700);
    return () => clearTimeout(timer);
  }, [speak]);

  return (
    <PageShell showSidebar={false} activeTab={activeTab} onTabChange={onTabChange}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 24 }}>
        <section
          style={{
            background: "linear-gradient(135deg, #0b3d91 0%, #174d83 45%, #1f5d9e 100%)",
            borderRadius: 22,
            padding: 30,
            color: "#fff",
            boxShadow: "0 20px 42px rgba(11, 61, 145, 0.18)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <ShieldCheck size={14} />
              Government-supported assistance
            </span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              {""}
              🚩 Trusted by citizens across India
            </span>
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.15 }}>
            Legal aid support, made simple and accessible
          </h1>
          <p style={{ maxWidth: 760, margin: 0, fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.9)" }}>
            Get trusted, easy-to-understand help for legal queries, certificates, document guidance, and emergency services. We assist citizens in Hindi, English, and Hinglish with official-style support.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 250px) repeat(2, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={20} />
                </span>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Citizen-friendly</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Easy language</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Star size={20} />
                </span>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Official feel</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Government style</div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
              <GovCard title="Why use legal aid?" subtitle="Trusted support for every citizen" icon={FolderCheck} accentColor="#0f766e">
                <p style={{ margin: 0, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                  Legal aid connects you with government-supported help for everyday disputes, official filing, and legal literacy. Use this portal to move forward with confidence.
                </p>
              </GovCard>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <GovButton variant="primary" size="md" icon={PhoneCall} onClick={() => window.open("tel:1516", "_self")}>Call 1516</GovButton>
                <GovButton variant="secondary" size="md" icon={MessageCircle} onClick={() => window.location.assign("/")}>Return to dashboard</GovButton>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {serviceCards.map((card) => {
            const Icon = card.icon;
            return (
              <GovCard key={card.title} title={card.title} subtitle={card.subtitle} accentColor={card.accent} icon={Icon}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75 }}>{card.text}</p>
              </GovCard>
            );
          })}
        </div>

        <GovCard title="Special support for vulnerable groups" subtitle="Focused help for women, seniors, and people with disabilities" icon={Accessibility} accentColor="#0b3d91">
          <div style={{ display: "grid", gap: 14 }}>
            {accessibilitySupport.map((item) => (
              <div key={item.title} style={{ padding: 16, borderRadius: 16, background: "var(--bg-surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</div>
                  <span style={{ fontSize: 18 }}>{item.title === "Women and girls" ? "♀️" : item.title === "Adults aged 55+" ? "👵" : item.title === "People with disabilities" ? "♿" : "👁️"}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}

          </div>
        </GovCard>

        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <GovCard title="How this service works" subtitle="Small helpful steps" icon={BadgeCheck} accentColor="#d97706">
              <div style={{ display: "grid", gap: 12 }}>
                {howItWorks.map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 34, height: 34, borderRadius: 10, background: "var(--navy-light)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.label.split(" ")[1]}
                    </div>
                    <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </GovCard>

            <GovCard title="Useful resources" subtitle="Downloadable guides" icon={FileText} accentColor="#0f766e">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>📄</span>
                  <span style={{ color: "var(--text-secondary)" }}>RTI application template</span>
                </li>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>📝</span>
                  <span style={{ color: "var(--text-secondary)" }}>Notice and complaint sample</span>
                </li>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>🛡️</span>
                  <span style={{ color: "var(--text-secondary)" }}>Legal rights quick summary</span>
                </li>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>🦽</span>
                  <span style={{ color: "var(--text-secondary)" }}>Disability scheme support guide</span>
                </li>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>👵</span>
                  <span style={{ color: "var(--text-secondary)" }}>Rights for older citizens</span>
                </li>
                <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--saffron)", fontSize: 18 }}>🔊</span>
                  <span style={{ color: "var(--text-secondary)" }}>Audio-friendly help tips</span>
                </li>
              </ul>
            </GovCard>
          </div>

          <GovCard title="Common questions" subtitle="FAQ for citizens" icon={Star} accentColor="#0b3d91">
            <div style={{ display: "grid", gap: 12 }}>
              {faqItems.map((item) => (
                <div key={item.question} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "var(--bg-surface-2)" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{item.question}</div>
                  <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 14 }}>{item.answer}</div>
                </div>
              ))}
            </div>
          </GovCard>
        </div>
      </div>
    </PageShell>
  );
}
