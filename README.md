# HaqDaar — हक़दार 🇮🇳

> **"Every Indian deserves to know what they are entitled to — in their own language, in their own voice."**

HaqDaar is an AI-powered platform that lets anyone describe their life situation in plain conversational language — Hindi, English, or their regional language — and instantly discover every government scheme, benefit, scholarship, or opportunity they personally qualify for, along with exactly how to apply.

---

## 🎯 The Problem

India has **1,000+ central and state government schemes** — scholarships, housing subsidies, health coverage, skill development programs, startup grants, women's welfare benefits — but crores of eligible people never access them.

Not because they don't need them. **Because they don't know they exist.**

- A first-gen college student doesn't know which scholarship she qualifies for
- A daily wage worker doesn't know he's eligible for free health insurance  
- A small farmer doesn't know there's a loan waiver scheme in his state

The gap isn't eligibility — it's **awareness and access**.

---

## 💡 The Solution

HaqDaar bridges this gap using:

- **Conversational AI** — Talk naturally, no forms to fill
- **Multilingual NLP** — Hindi, English, Tamil, Telugu, Bengali, Marathi, and more
- **Voice Interface** — Web Speech API (STT) + browser TTS for low-literacy users
- **AI Profile Extraction** — Claude LLM silently extracts eligibility profile from conversation
- **Hybrid Matching Engine** — Rule-based hard filters + ML re-ranking
- **Plain Language Explanations** — No bureaucratic jargon
- **Step-by-step Application Guidance** — Documents needed, where to go, portal links

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/haqdaar.git
cd haqdaar

# Install dependencies
npm install

# Add your API key
# Create a .env file:
echo "VITE_ANTHROPIC_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔑 API Key Setup

HaqDaar uses the Anthropic Claude API for conversational AI. 

**For the prototype**, the API key is passed directly from the frontend (fine for demos).  
**For production**, use a backend proxy to keep the key secure.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it to your `.env` file as `VITE_ANTHROPIC_API_KEY=sk-ant-...`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React PWA (Frontend)         │
│   Voice Input │ Chat UI │ Results   │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      Claude API (Anthropic)          │
│  Conversational Profile Extraction   │
│  Multilingual NLP + Explanation      │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      Eligibility Matching Engine     │
│  Rule-based Hard Filters (JSON)      │
│  Score-based Re-ranking              │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│        Scheme Database               │
│  15+ Central Schemes (MVP Seed)      │
│  Structured JSON with eligibility    │
└─────────────────────────────────────┘
```

---

## 📱 Features (MVP)

| Feature | Status |
|---|---|
| Conversational intake (Hindi + English) | ✅ |
| AI profile extraction (Claude) | ✅ |
| Scheme matching engine | ✅ |
| 15 seed schemes (Central) | ✅ |
| Voice input (Web Speech API) | ✅ |
| Voice output (Browser TTS) | ✅ |
| Mobile-first responsive UI | ✅ |
| Scheme detail + documents list | ✅ |
| Application portal links | ✅ |

---

## 🗺️ Scheme Categories Covered

- 🌾 **Agriculture** — PM-KISAN, KCC, Fasal Bima, PM Krishi Sinchai
- 💊 **Health** — Ayushman Bharat PM-JAY
- 🎓 **Scholarships** — NSP Pre/Post Matric SC/ST, OBC scholarships  
- 🏠 **Housing** — PM Awas Yojana Gramin
- 🚀 **Startup/Business** — PM MUDRA Yojana
- 🏦 **Financial Inclusion** — PM Jan Dhan, PMJJBY, PMSBY
- 👩 **Women's Welfare** — Sukanya Samriddhi, Widow Pension
- 🔧 **Skill Development** — PM Kaushal Vikas Yojana (PMKVY)
- 👴 **Senior Citizens** — National Old Age Pension

---

## 🌍 Language Support

**Currently working:**
- Hindi (हिंदी)
- English

**Voice STT (via Web Speech API):**
- Tamil (தமிழ்)
- Telugu (తెలుగు)  
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)

**Roadmap:**
- Bhojpuri, Maithili → via Bhashini API
- Odia, Malayalam, Kannada, Punjabi

---

## 🏗️ Project Structure

```
haqdaar/
├── src/
│   ├── App.jsx              # Main application (landing, chat, results)
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind + global styles
│   └── data/
│       └── schemes.js       # Scheme database + matching engine
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

### Phase 1 — MVP (Current)
- [x] Core conversational UI
- [x] Claude-powered profile extraction
- [x] 15 central schemes
- [x] Hindi + English
- [x] Voice input/output

### Phase 2 — Regional Expansion
- [ ] 5 states (UP, MH, TN, WB, RJ) + state-specific schemes
- [ ] 6 more languages via Bhashini API
- [ ] IndicTTS integration for better Hindi TTS
- [ ] Offline PWA mode (FAISS on-device)
- [ ] WhatsApp sharing

### Phase 3 — National Scale
- [ ] All 28 states + UTs
- [ ] 500+ schemes
- [ ] DigiLocker integration (auto-fill documents)
- [ ] CSC (Common Service Centre) integration
- [ ] WhatsApp Business Bot

---

## 🤝 Contributing

HaqDaar is a civic tech project. Contributions welcome!

Most needed:
1. **Scheme data** — Adding more schemes (see `src/data/schemes.js` format)
2. **Translations** — Scheme names/descriptions in regional languages
3. **Testing** — Test with real user personas across states

---

## 📄 License

MIT License — free to use, fork, and deploy.

---

## 🙏 Built With Love For India

HaqDaar was built to ensure that the most vulnerable citizens — daily wage workers, small farmers, first-gen students, single mothers — can access the safety nets their government has built for them.

**हर भारतीय का हक — उनकी भाषा में, उनकी आवाज़ में**  
*Every Indian's right — in their language, in their voice.*

---

*Built by [Your Name/Team] | Competition Entry — AI for Social Good*
