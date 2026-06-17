<div align="center">

<img src=".frontend/assets/ashoka-emblem.svg"
    height="100"
    alt="Ashoka Emblem — Government of India" 
/>

# न्याय सहायक · Nyaya Sahayak

**Legal Aid Assistant for Every Indian Citizen**

*A Government of India Initiative — Built for Accessibility, Designed for Dignity*

---

[![Phase](https://img.shields.io/badge/Phase-2%20of%206-003580?style=for-the-badge&logo=react&logoColor=white)](https://github.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-FF6200?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-046A38?style=for-the-badge&logo=accessibility&logoColor=white)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-Gov%20Open%20Data-C8960C?style=for-the-badge)](https://data.gov.in/government-open-data-license-version-2)

---

> 🎯 **Mission** — Make Indian legal aid **accessible, understandable, and available** to every citizen — especially those who are visually impaired — in their own language, at zero cost.

</div>

---

## 🇮🇳 What is Nyaya Sahayak?

**Nyaya Sahayak** (न्याय सहायक, *"Justice Helper"*) is a React-based legal aid chatbot built as a Government of India initiative under the Ministry of Law and Justice. It helps citizens — particularly the **visually impaired** — navigate the Indian legal system through:

- 🗣️ **Voice-first interaction** — speak your question in Hindi, English, or Hinglish
- 🏛️ **8 legal domains** — RTI, Property, Consumer, Family, Labour, Disability, Schemes, FIR
- 📖 **Plain language** — no legal jargon, no literacy barrier
- ♿ **WCAG 2.1 AA** — built accessibility-first from the ground up
- 🆓 **Free & open** — available to all citizens, no registration required

---

## 🏗️ System Architecture

The following diagram shows the overall architecture of Nyaya Sahayak, including accessibility services, legal domain routing, voice interaction, and the user interface layers.

<div align="center">

<img src=".frontend/assets/legal_chatbot_architecture"
     alt="Nyaya Sahayak Architecture"
     width="100%" />

</div>

---

## 🗺️ Project Roadmap

```
Phase 1 ✅  →  Phase 2 ✅  →  Phase 3 🔄  →  Phase 4 ⏳  →  Phase 5 ⏳  →  Phase 6 ⏳
Accessibility    Gov UI        Chat + NLP      Documents      Schemes         Deploy
Foundation       Shell         Routing         & Forms        Database        & PWA
```

| Phase | Title | Status | Key Deliverable |
|-------|-------|--------|-----------------|
| **1** | Accessibility Foundation | ✅ Complete | TTS, STT, contrast, font scaling |
| **2** | Government UI Shell | ✅ Complete | Header, Sidebar, Dashboard, components |
| **3** | Chat Interface & NLP Routing | 🔄 Next | Conversational UI, topic routing |
| **4** | Document Generation | ⏳ Planned | RTI forms, FIR drafts, PDF export |
| **5** | Schemes & Entitlements | ⏳ Planned | PM scheme eligibility checker |
| **6** | Deploy & PWA | ⏳ Planned | Offline support, NIC hosting |

---

## ✅ Phase 1 — Accessibility Foundation

> *"A legal tool is only as useful as it is accessible."*

Phase 1 laid the bedrock — every interaction in the app is built on this foundation.

### 🧩 What was built

| File | Purpose |
|------|---------|
| `accessibilityStore.js` | Zustand store — font size, high contrast, TTS, STT, language |
| `useTTS.js` | Web Speech API wrapper — `speak()`, `stop()`, `isSpeaking` |
| `useSTT.js` | Speech Recognition wrapper — `startListening()`, `transcript`, `isListening` |
| `AccessibilityToolbar.jsx` | Sticky toolbar — TTS toggle, font size, contrast, language |
| `SkipToContent.jsx` | Skip link — first focusable element, targets `#main-content` |
| `App.jsx` | Body class management — applies fontSize + high-contrast globally |
| `index.css` | `.high-contrast` global styles + `prefers-reduced-motion` |

### ⚙️ Store Shape (`accessibilityStore.js`)

```js
{
  fontSize:      "normal" | "large" | "xlarge",   // body font scale
  highContrast:  boolean,                          // black bg / white text
  ttsEnabled:    boolean,       // default: true
  ttsSpeed:      number,        // default: 1.0
  ttsVoiceLang:  string,        // default: "hi-IN"
  language:      "hindi" | "english" | "hinglish"
}
```

### 🗣️ TTS + STT Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Web Speech API                      │
│                                                      │
│   window.speechSynthesis      SpeechRecognition      │
│         ▲                           ▲                │
│         │                           │                │
│    useTTS.js                   useSTT.js             │
│  speak(text)              startListening()           │
│  stop()                   stopListening()            │
│  isSpeaking               transcript                 │
│                           isListening                │
└─────────────────────────────────────────────────────┘
         ▲                           ▲
         └──────────┬────────────────┘
                    │
            accessibilityStore
        (ttsEnabled, ttsSpeed, language)
```

### 🌐 Language Support

| Code | Label | Speech Locale |
|------|-------|---------------|
| `hindi` | हिन्दी | `hi-IN` |
| `english` | English | `en-IN` |
| `hinglish` | Hinglish | `hi-IN` (code-mixed) |

---

## ✅ Phase 2 — Government UI Shell

> *"An official interface builds trust. Trust opens access."*

Phase 2 gives Nyaya Sahayak its identity — modelled after [india.gov.in](https://india.gov.in) with the Tiranga palette, Noto Devanagari typography, and a layout that works for sighted and screen-reader users alike.

### 🎨 Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary Blue** | `#003580` | Headers, sidebar, primary buttons |
| **Accent Saffron** | `#FF6200` | Active states, badges, highlights |
| **Accent Green** | `#046A38` | Success, online, confirmed |
| **Page Background** | `#F1F4F8` | App background |
| **Card Background** | `#FFFFFF` | All card surfaces |
| **Border** | `#D0D7E2` | All borders, dividers |
| **Gov Gold** | `#C8960C` | Emblem details, NIC badge |
| **Text Primary** | `#0D0D0D` | Body text |
| **Text Muted** | `#718096` | Subtitles, secondary labels |

### 🗂️ Files Delivered

```
src/
├── constants/
│   └── legalTopics.js          ← 8 legal topic definitions (id, labels, icon, act, color)
├── components/
│   ├── layout/
│   │   ├── GovHeader.jsx       ← 3-zone official header (strip + main bar + nav tabs)
│   │   ├── Sidebar.jsx         ← Fixed left nav with topic list + helpline card
│   │   ├── PageShell.jsx       ← Full layout assembler (header + sidebar + main + footer)
│   │   └── GovFooter.jsx       ← Ministry attribution + NIC credit
│   └── ui/
│       ├── GovButton.jsx       ← Reusable button (primary / secondary / ghost × sm/md/lg)
│       ├── GovBadge.jsx        ← Pill badge (blue / saffron / green / gold / grey)
│       └── GovCard.jsx         ← White card with accent border, icon, badge slot
└── pages/
    └── Dashboard.jsx           ← Main landing page (banner + stats + topics + how-to)
```

### 🏛️ GovHeader — Three-Zone Layout

```
┌──────────────────────────────────────────────────────────────┐  ← 28px
│  भारत सरकार | Government of India    [Skip] [Screen Reader]  │  Zone A: Identity strip
├──────────────────────────────────────────────────────────────┤  ← ~60px
│  🏛 न्याय सहायक                        [🔊] [T] [◑]          │  Zone B: Emblem + controls
│     Nyaya Sahayak — Legal Aid Assistant                      │
├──────────────────────────────────────────────────────────────┤  ← 40px
│  होम  |  कानूनी सहायता  |  दस्तावेज़  |  सहायता             │  Zone C: Nav tabs
└──────────────────────────────────────────────────────────────┘
Total: ~128px  →  CSS variable: --header-height: 128px
```

### 📐 Page Layout

```
┌─────────────────────────────── Full viewport width ──────────────────────────────┐
│                        GovHeader (fixed, z-index: 1000)                          │
├──────────────────┬───────────────────────────────────────────────────────────────┤
│                  │                                                               │
│   Sidebar        │                  Main Content Area                            │
│   (fixed)        │              <main id="main-content">                         │
│   260px wide     │              ml-[260px], bg #F1F4F8                         │
│                  │                                                               │
│  • Legal Topics  │  ┌──────── Welcome Banner ────────┐                           │
│  • Active state  │  │  #003580 bg + saffron border   │                         │
│    (saffron      │  └────────────────────────────────┘                           │
│     left border) │                                                               │
│                  │  ┌─── Stat ───┐ ┌─── Stat ───┐ ┌─── Stat ───┐                 │
│  ┌────────────┐  │  │  8 Domains │ │ RTI Guide  │ │  Helpline  │                 │
│  │   1516     │  │  └────────────┘ └────────────┘ └────────────┘                 │
│  │  Helpline  │  │                                                               │
│  │  Toll Free │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐  ← 4-col topic grid                      │
│  └────────────┘  │  │  │ │  │ │  │ │  │                                          │
│                  │  └──┘ └──┘ └──┘ └──┘                                          │
│  v1.0 Beta • NIC │  ┌──┐ ┌──┐ ┌──┐ ┌──┐                                          │
│                  │  └──┘ └──┘ └──┘ └──┘                                          │
│                  │                                                               │
│                  │  Step 1 → Step 2 → Step 3  ← How to use                       │
├──────────────────┴───────────────────────────────────────────────────────────────┤
│                          GovFooter (in flow)                                     │
│     © 2025 Ministry of Law and Justice, GoI          Designed by [NIC]           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### ⚖️ Legal Topics (`legalTopics.js`)

| # | ID | Hindi | English | Act |
|---|----|-------|---------|-----|
| 1 | `rti` | सूचना का अधिकार | Right to Information | RTI Act, 2005 |
| 2 | `property` | संपत्ति कानून | Property Law | Transfer of Property Act, 1882 |
| 3 | `consumer` | उपभोक्ता संरक्षण | Consumer Protection | Consumer Protection Act, 2019 |
| 4 | `family` | पारिवारिक कानून | Family Law | Hindu Marriage Act / Special Marriage Act |
| 5 | `labour` | श्रम कानून | Labour Law | Industrial Disputes Act, 1947 |
| 6 | `disability` | दिव्यांग अधिकार | Disability Rights | RPWD Act, 2016 |
| 7 | `schemes` | सरकारी योजनाएँ | Government Schemes | PM Schemes & Entitlements |
| 8 | `fir` | प्रथम सूचना रिपोर्ट | FIR / Police Complaint | CrPC Section 154 |

### 🧱 UI Component API

#### `GovButton`
```jsx
<GovButton
  variant="primary"    // "primary" | "secondary" | "ghost"
  size="md"            // "sm" | "md" | "lg"
  icon={Mic}           // lucide component (optional)
  onClick={handler}
  ariaLabel="..."
  disabled={false}
>
  Start Legal Chat
</GovButton>
```

#### `GovBadge`
```jsx
<GovBadge
  label="Active"
  color="blue"   // "blue" | "saffron" | "green" | "gold" | "grey"
/>
```

#### `GovCard`
```jsx
<GovCard
  title="RTI Filing Guide"
  subtitle="RTI Act, 2005"
  icon={FileText}
  accentColor="#FF6200"
  badge={<GovBadge label="Most Used" color="saffron" />}
  onClick={() => handleSelect()}
  ariaLabel="Right to Information — RTI Act, 2005"
>
  Optional children content
</GovCard>
```

---

## ♿ Accessibility Architecture

Nyaya Sahayak is designed for users who rely on screen readers (NVDA, JAWS, VoiceOver) and keyboard-only navigation. Every component follows these rules:

```
Tab Order:
  [Skip Link] → [Screen Reader Access] → [TTS Toggle] → [Font Size] →
  [Contrast] → [Nav Tabs] → [Sidebar Topics] → [Main Content]
```

| Feature | Implementation |
|---------|---------------|
| Skip to content | `<a href="#main-content">` — always visible in strip |
| Screen reader guidance | `speak()` on button click with navigation instructions |
| Focus rings | `2px solid #003580`, offset `2px` — all interactive elements |
| Landmark roles | `banner`, `main`, `nav`, `contentinfo`, `complementary` |
| ARIA labels | Every icon-only button has `aria-label` |
| `aria-pressed` | TTS toggle, contrast toggle |
| `aria-current` | Active sidebar topic |
| `aria-live` | TTS announcements for state changes |
| `prefers-reduced-motion` | All transitions disabled via CSS media query |
| High contrast mode | `.high-contrast` — black bg, white text, white borders |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18 |
| Build tool | Vite | 5 |
| Styling | Tailwind CSS | v3 |
| State | Zustand | latest |
| Routing | react-router-dom | v6 |
| Icons | lucide-react | latest |
| Voice I/O | Web Speech API | native |
| Fonts | Noto Sans + Noto Sans Devanagari | Google Fonts |
| Meta tags | react-helmet-async | latest |

---

## 📁 Full File Structure (Phase 2 complete)

```
nyaya-sahayak/
├── public/
├── index.html                          ← Noto Sans Google Fonts link here
└── src/
    ├── main.jsx
    ├── App.jsx                         ← Route "/" → Dashboard
    ├── index.css                       ← .high-contrast, .devanagari, prefers-reduced-motion
    ├── assets/
    │   └── ashoka-emblem.svg
    ├── constants/
    │   └── legalTopics.js              ← 8 topic definitions
    ├── store/
    │   └── accessibilityStore.js       ← Phase 1, frozen
    ├── hooks/
    │   ├── useTTS.js                   ← Phase 1, frozen
    │   └── useSTT.js                   ← Phase 1, frozen
    ├── components/
    │   ├── accessibility/
    │   │   ├── AccessibilityToolbar.jsx
    │   │   └── SkipToContent.jsx
    │   ├── layout/
    │   │   ├── GovHeader.jsx           ← 3-zone header
    │   │   ├── Sidebar.jsx             ← Topic nav + helpline
    │   │   ├── PageShell.jsx           ← Layout assembler
    │   │   └── GovFooter.jsx           ← Ministry footer
    │   └── ui/
    │       ├── GovButton.jsx           ← primary/secondary/ghost
    │       ├── GovBadge.jsx            ← pill badges
    │       └── GovCard.jsx             ← accent-border cards
    └── pages/
        ├── Home.jsx                    ← Phase 1, kept but unused
        └── Dashboard.jsx              ← Active landing page
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/gov-india/nyaya-sahayak.git
cd nyaya-sahayak

# Install dependencies
npm install

# Install Phase 2 additions
npm install react-helmet-async

# Run development server
npm run dev
```

> **Browser requirement:** Chrome or Edge recommended for full Web Speech API support (TTS + STT). Firefox supports TTS only.

---

## ✅ Phase 2 Checklist

- [x] Ashoka emblem visible in header
- [x] All 8 legal topic cards render in Dashboard
- [x] Sidebar highlights active topic with saffron left border
- [x] TTS speaks on Dashboard mount (600ms delay for stability)
- [x] Tab order: skip link → header controls → nav tabs → sidebar → main content
- [x] High contrast mode applies correctly via `.high-contrast` body class
- [x] `--header-height: 128px` CSS variable set on `:root` by PageShell
- [x] Sidebar fixed at 260px, full height minus header
- [x] No horizontal scroll at 1280px viewport width
- [x] All interactive elements have visible focus rings
- [x] `GovButton`, `GovBadge`, `GovCard` are the only UI primitives used

---

## 📞 Helpline

<div align="center">

**राष्ट्रीय विधिक सेवा प्राधिकरण**
*National Legal Services Authority*

# 📱 1516
**Toll Free · Available 24×7**

*For immediate legal aid, call or click the helpline card in the sidebar.*

</div>

---

<div align="center">

**© 2025 Ministry of Law and Justice, Government of India**

Designed & Developed by **NIC** — National Informatics Centre

*न्याय सबके लिए · Justice for All*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Accessibility First](https://img.shields.io/badge/Accessibility-First-046A38?style=flat-square)](https://www.w3.org/WAI/)
[![Government of India](https://img.shields.io/badge/Government%20of-India-FF6200?style=flat-square)](https://india.gov.in/)

</div>