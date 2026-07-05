import { useMemo, useRef, useState } from "react";
import PageShell from "../components/layout/PageShell";
import GovCard from "../components/ui/GovCard";
import GovButton from "../components/ui/GovButton";
import { Compass, FileText, LifeBuoy, UploadCloud, ShieldCheck, CheckCircle2 } from "lucide-react";

const uploadHints = [
  "PDF, JPG, or PNG files only",
  "Maximum file size: 10 MB",
  "Encrypted upload is supported for sensitive documents",
];

export default function PlaceholderPage({ title, subtitle, activeTab, onTabChange }) {
  const iconMap = {
    Documents: FileText,
    "Help & Support": LifeBuoy,
  };
  const Icon = iconMap[title] ?? Compass;
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const selectedLabel = useMemo(() => {
    if (!files.length) return "No files selected yet";
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  const handleFileChange = (event) => {
    const incoming = Array.from(event.target.files || []);
    setFiles(incoming);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const incoming = Array.from(event.dataTransfer?.files || []);
    setFiles(incoming);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <PageShell showSidebar={false} activeTab={activeTab} onTabChange={onTabChange}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 20 }}>
        <GovCard title={title} subtitle={subtitle} icon={Icon} accentColor="#0b3d91">
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ margin: 0, lineHeight: 1.7, color: "var(--text-secondary)" }}>
              Upload official documents securely for review, guidance, or recordkeeping through a trusted government-style submission portal.
            </p>

            <div
              onClick={openFilePicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFilePicker();
                }
              }}
              style={{
                border: `2px dashed ${isDragging ? "var(--navy)" : "var(--border-strong)"}`,
                borderRadius: 16,
                padding: 24,
                background: isDragging
                  ? "linear-gradient(135deg, var(--navy-light) 0%, var(--bg-surface) 100%)"
                  : "linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%)",
                display: "grid",
                gap: 12,
                cursor: "pointer",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--navy-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)" }}>
                  <UploadCloud size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Upload your document</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Drag and drop files or browse from your device</div>
                </div>
              </div>

              <label style={{ display: "inline-flex", width: "fit-content" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <GovButton variant="primary" size="md" icon={UploadCloud}>Choose files</GovButton>
              </label>

              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedLabel}</div>

              <div style={{ display: "grid", gap: 8 }}>
                {uploadHints.map((hint) => (
                  <div key={hint} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={15} style={{ color: "var(--green)" }} />
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GovCard>

        <GovCard title="Helpful guidance" subtitle="What to expect after submission" icon={ShieldCheck} accentColor="#0f766e">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--green-light)", color: "var(--green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Upload only official or relevant supporting documents for the service you need.</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--green-light)", color: "var(--green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</span>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>You will receive confirmation once the document is accepted for processing.</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--green-light)", color: "var(--green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</span>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>For sensitive files, use only the official submission channel and keep your credentials safe.</div>
            </div>
          </div>
        </GovCard>

        <GovCard title="Common document types" subtitle="Prepare the right files" icon={FileText} accentColor="#0b3d91">
          <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            <li>Identity documents: Aadhaar, voter ID, passport</li>
            <li>Address proof: ration card, utility bill, bank statement</li>
            <li>Legal forms: RTI applications, complaints, notices</li>
            <li>Evidence and certificates: medical reports, bills, witness statements</li>
          </ul>
        </GovCard>

        <GovCard title="Support for vulnerable citizens" subtitle="Women, seniors, and persons with disabilities" icon={LifeBuoy} accentColor="#0f766e">
          <div style={{ display: "grid", gap: 12, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--navy-light)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>A</span>
              <div>Upload emergency documents for family protection, disability benefits, or senior citizen support.</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--navy-light)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>B</span>
              <div>Include a short cover note describing the issue and the service you need to speed review.</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--navy-light)", color: "var(--navy)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>C</span>
              <div>If you need audio or large-print support, we recommend adding a note for preferred communication.</div>
            </div>
          </div>
        </GovCard>
      </div>
    </PageShell>
  );
}
