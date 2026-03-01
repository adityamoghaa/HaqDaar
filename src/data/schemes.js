export const schemes = [
  {
    id: "PM-KISAN-001",
    name: "PM-KISAN Samman Nidhi",
    nameHindi: "पीएम किसान सम्मान निधि",
    category: "agriculture",
    level: "central",
    benefit: "₹6,000/year in 3 installments directly in bank account",
    benefitHindi: "₹6,000 प्रति वर्ष — 3 किस्तों में सीधे बैंक में",
    eligibility: {
      occupation: ["farmer"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      gender: "all",
      states: ["all"],
      exclusions: ["income_tax_payers", "government_employees", "professionals"],
    },
    documents: ["Aadhaar Card", "Land Records (Khatoni)", "Bank Passbook", "Mobile Number"],
    apply_url: "https://pmkisan.gov.in",
    apply_mode: ["Online (pmkisan.gov.in)", "Village Patwari / Lekhpal", "CSC Center"],
    emoji: "🌾",
    match_keywords: ["farmer", "kisan", "kheti", "agriculture", "land"],
  },
  {
    id: "AYUSHMAN-001",
    name: "Ayushman Bharat PM-JAY",
    nameHindi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना",
    category: "health",
    level: "central",
    benefit: "₹5 lakh/year free health insurance for hospitalisation at empanelled hospitals",
    benefitHindi: "₹5 लाख तक मुफ्त इलाज — सरकारी और प्राइवेट अस्पतालों में",
    eligibility: {
      occupation: ["all"],
      income_max: 100000,
      caste: ["all"],
      age_min: 0,
      gender: "all",
      states: ["all"],
      bpl_card: true,
      exclusions: ["above_poverty_line_non_secc"],
    },
    documents: ["Aadhaar Card", "Ration Card", "SECC 2011 Data (auto-verified)", "Income Certificate"],
    apply_url: "https://pmjay.gov.in",
    apply_mode: ["Hospital Helpdesk", "pmjay.gov.in", "Toll-free: 14555"],
    emoji: "💊",
    match_keywords: ["health", "hospital", "insurance", "sehat", "bimari", "ilaaj"],
  },
  {
    id: "KCC-001",
    name: "Kisan Credit Card (KCC)",
    nameHindi: "किसान क्रेडिट कार्ड",
    category: "agriculture",
    level: "central",
    benefit: "Agricultural loan up to ₹3 lakh at 4% interest (with prompt repayment subsidy)",
    benefitHindi: "4% ब्याज पर ₹3 लाख तक कृषि ऋण",
    eligibility: {
      occupation: ["farmer"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      gender: "all",
      states: ["all"],
    },
    documents: ["Aadhaar", "Land Records", "Bank Account", "Passport Photo"],
    apply_url: "https://pmkisan.gov.in/kcc.aspx",
    apply_mode: ["Nearest Bank Branch", "Co-operative Banks", "NABARD"],
    emoji: "💳",
    match_keywords: ["loan", "credit", "karz", "farmer", "kisan", "kheti"],
  },
  {
    id: "NSP-SC-001",
    name: "National Scholarship - Pre Matric (SC/ST)",
    nameHindi: "राष्ट्रीय छात्रवृत्ति — SC/ST छात्र",
    category: "scholarship",
    level: "central",
    benefit: "₹150–₹350/month maintenance allowance + ₹500–₹750 ad-hoc grant for students in Class 9–10",
    benefitHindi: "₹150–₹350 प्रतिमाह + ₹750 तक वार्षिक अनुदान",
    eligibility: {
      occupation: ["student"],
      income_max: 250000,
      caste: ["SC", "ST"],
      age_min: 14,
      age_max: 20,
      gender: "all",
      states: ["all"],
      education: ["class 9", "class 10"],
    },
    documents: ["Aadhaar", "Caste Certificate", "Income Certificate", "Mark Sheet", "Bank Passbook"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP portal)", "School Principal", "Deadline: Oct 31 every year"],
    emoji: "🎓",
    match_keywords: ["student", "scholarship", "padhai", "school", "SC", "ST"],
  },
  {
    id: "NSP-POST-001",
    name: "Post Matric Scholarship for SC Students",
    nameHindi: "पोस्ट मैट्रिक छात्रवृत्ति — SC छात्र",
    category: "scholarship",
    level: "central",
    benefit: "Full tuition + ₹1,200–₹2,000/month maintenance for 11th onwards up to PhD",
    benefitHindi: "पूरी फीस + ₹1,200–₹2,000/माह छात्रवृत्ति — 11वीं से पीएचडी तक",
    eligibility: {
      occupation: ["student"],
      income_max: 250000,
      caste: ["SC"],
      age_min: 16,
      gender: "all",
      states: ["all"],
      education: ["11th", "12th", "graduation", "post graduation", "college", "university"],
    },
    documents: ["Aadhaar", "Caste Certificate", "Income Certificate", "College ID", "Fee Receipt", "Bank Passbook"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in", "College Welfare Officer", "Deadline: Nov 30 every year"],
    emoji: "📚",
    match_keywords: ["student", "scholarship", "college", "university", "SC", "dalit", "padhai"],
  },
  {
    id: "PMAY-G-001",
    name: "PM Awas Yojana - Gramin (Rural Housing)",
    nameHindi: "प्रधानमंत्री आवास योजना — ग्रामीण",
    category: "housing",
    level: "central",
    benefit: "₹1.2–₹1.3 lakh grant to build permanent house (plain areas); ₹1.3 lakh in hilly areas",
    benefitHindi: "पक्का घर बनाने के लिए ₹1.20–₹1.30 लाख की सहायता",
    eligibility: {
      occupation: ["all"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      gender: "all",
      states: ["all"],
      area: ["rural"],
      exclusions: ["pucca_house_owners"],
    },
    documents: ["Aadhaar", "BPL Card", "Bank Account", "Land Documents", "SECC 2011 registration"],
    apply_url: "https://pmayg.nic.in",
    apply_mode: ["Gram Panchayat Office", "pmayg.nic.in", "Block Development Office"],
    emoji: "🏠",
    match_keywords: ["house", "ghar", "housing", "makan", "awas", "rural", "village", "gaon"],
  },
  {
    id: "MUDRA-001",
    name: "PM MUDRA Yojana",
    nameHindi: "प्रधानमंत्री मुद्रा योजना",
    category: "startup",
    level: "central",
    benefit: "Loans from ₹50,000 to ₹10 lakh for small businesses — no collateral required",
    benefitHindi: "₹50,000 से ₹10 लाख तक बिना गारंटी के व्यापार ऋण",
    eligibility: {
      occupation: ["self_employed", "small_business", "entrepreneur"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      gender: "all",
      states: ["all"],
    },
    documents: ["Aadhaar", "PAN Card", "Business Plan", "Bank Statement", "Address Proof"],
    apply_url: "https://mudra.org.in",
    apply_mode: ["Any Nationalised Bank", "Microfinance Institutions", "mudra.org.in"],
    emoji: "🚀",
    match_keywords: ["business", "startup", "shop", "dukan", "loan", "entrepreneur", "self employed"],
  },
  {
    id: "PMJDY-001",
    name: "PM Jan Dhan Yojana (Zero-Balance Bank Account)",
    nameHindi: "प्रधानमंत्री जन धन योजना",
    category: "financial",
    level: "central",
    benefit: "Free bank account + RuPay debit card + ₹2 lakh accident insurance + ₹30,000 life cover",
    benefitHindi: "मुफ्त बैंक खाता + RuPay कार्ड + ₹2 लाख दुर्घटना बीमा",
    eligibility: {
      occupation: ["all"],
      income_max: null,
      caste: ["all"],
      age_min: 10,
      gender: "all",
      states: ["all"],
      no_bank_account: true,
    },
    documents: ["Aadhaar Card (or any ID proof)", "Passport Photo"],
    apply_url: "https://pmjdy.gov.in",
    apply_mode: ["Any Nationalised Bank Branch", "Business Correspondent (BC) Agent"],
    emoji: "🏦",
    match_keywords: ["bank", "account", "saving", "bachat", "no account", "koi account nahi"],
  },
  {
    id: "BBBP-001",
    name: "Beti Bachao Beti Padhao — Sukanya Samriddhi Yojana",
    nameHindi: "बेटी बचाओ बेटी पढ़ाओ — सुकन्या समृद्धि योजना",
    category: "women",
    level: "central",
    benefit: "Tax-free savings scheme for girl child at 8.2% interest — maturity value for education/marriage",
    benefitHindi: "बेटी की शिक्षा/विवाह के लिए 8.2% ब्याज पर टैक्स-फ्री बचत",
    eligibility: {
      occupation: ["all"],
      income_max: null,
      caste: ["all"],
      age_min: 0,
      age_max: 10,
      gender: "female",
      states: ["all"],
    },
    documents: ["Girl Child's Birth Certificate", "Parent Aadhaar", "Bank Account"],
    apply_url: "https://www.india.gov.in/sukanya-samriddhi-yojna",
    apply_mode: ["Post Office", "Nationalised Bank Branch"],
    emoji: "👧",
    match_keywords: ["girl", "beti", "daughter", "women", "female", "mahila"],
  },
  {
    id: "PMJJBY-001",
    name: "PM Jeevan Jyoti Bima Yojana (Life Insurance)",
    nameHindi: "प्रधानमंत्री जीवन ज्योति बीमा योजना",
    category: "financial",
    level: "central",
    benefit: "₹2 lakh life insurance cover at just ₹436/year premium — auto-deducted from bank",
    benefitHindi: "सिर्फ ₹436/साल में ₹2 लाख का जीवन बीमा",
    eligibility: {
      occupation: ["all"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      age_max: 50,
      gender: "all",
      states: ["all"],
      bank_account: true,
    },
    documents: ["Aadhaar", "Bank Account with ₹436 balance"],
    apply_url: "https://www.jansuraksha.gov.in",
    apply_mode: ["Bank Branch", "Bank App / Net Banking", "CSC Center"],
    emoji: "🛡️",
    match_keywords: ["insurance", "bima", "life insurance", "jeevan", "death"],
  },
  {
    id: "PMSBY-001",
    name: "PM Suraksha Bima Yojana (Accident Insurance)",
    nameHindi: "प्रधानमंत्री सुरक्षा बीमा योजना",
    category: "financial",
    level: "central",
    benefit: "₹2 lakh accident death/disability insurance at just ₹20/year",
    benefitHindi: "केवल ₹20/साल में ₹2 लाख का दुर्घटना बीमा",
    eligibility: {
      occupation: ["all"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      age_max: 70,
      gender: "all",
      states: ["all"],
    },
    documents: ["Aadhaar", "Bank Account"],
    apply_url: "https://www.jansuraksha.gov.in",
    apply_mode: ["Bank Branch", "Net Banking", "CSC"],
    emoji: "⚕️",
    match_keywords: ["accident", "insurance", "bima", "durghatna", "disability"],
  },
  {
    id: "SKILL-001",
    name: "PM Kaushal Vikas Yojana (PMKVY)",
    nameHindi: "प्रधानमंत्री कौशल विकास योजना",
    category: "skill",
    level: "central",
    benefit: "Free skill training + ₹8,000 reward + government-recognised certification + job placement",
    benefitHindi: "मुफ्त कौशल प्रशिक्षण + ₹8,000 इनाम + सर्टिफिकेट + नौकरी सहायता",
    eligibility: {
      occupation: ["unemployed", "daily_wage", "student"],
      income_max: null,
      caste: ["all"],
      age_min: 15,
      age_max: 45,
      gender: "all",
      states: ["all"],
    },
    documents: ["Aadhaar", "Educational Certificate", "Bank Account"],
    apply_url: "https://www.pmkvyofficial.org",
    apply_mode: ["pmkvyofficial.org", "Nearest PMKVY Training Center", "CSC"],
    emoji: "🔧",
    match_keywords: ["skill", "training", "job", "naukri", "unemployed", "kaam nahi", "berozgar"],
  },
  {
    id: "OAP-001",
    name: "National Social Assistance - Old Age Pension",
    nameHindi: "राष्ट्रीय वृद्धावस्था पेंशन",
    category: "senior",
    level: "central",
    benefit: "₹200–₹500/month pension for elderly below poverty line",
    benefitHindi: "₹200–₹500 प्रतिमाह वृद्धावस्था पेंशन",
    eligibility: {
      occupation: ["all"],
      income_max: 50000,
      caste: ["all"],
      age_min: 60,
      gender: "all",
      states: ["all"],
      bpl_card: true,
    },
    documents: ["Aadhaar", "Age Proof", "BPL Certificate", "Bank Passbook"],
    apply_url: "https://nsap.nic.in",
    apply_mode: ["Gram Panchayat Office", "Municipal Office", "District Social Welfare Office"],
    emoji: "👴",
    match_keywords: ["old", "senior", "budhapa", "pension", "elder", "retired", "aged"],
  },
  {
    id: "PMFBY-001",
    name: "PM Fasal Bima Yojana (Crop Insurance)",
    nameHindi: "प्रधानमंत्री फसल बीमा योजना",
    category: "agriculture",
    level: "central",
    benefit: "Crop insurance at 1.5–2% premium — covers losses due to drought, flood, pest, natural calamity",
    benefitHindi: "1.5–2% प्रीमियम पर फसल बीमा — सूखा, बाढ़, कीट सभी में सुरक्षा",
    eligibility: {
      occupation: ["farmer"],
      income_max: null,
      caste: ["all"],
      age_min: 18,
      gender: "all",
      states: ["all"],
    },
    documents: ["Aadhaar", "Land Records", "Bank Account", "Crop Sowing Certificate"],
    apply_url: "https://pmfby.gov.in",
    apply_mode: ["Nearest Bank Branch", "CSC Center", "pmfby.gov.in"],
    emoji: "🌱",
    match_keywords: ["crop", "fasal", "insurance", "bima", "drought", "flood", "khet", "farming"],
  },
  {
    id: "WIDOW-001",
    name: "Widow Pension (Vidhwa Pension Yojana)",
    nameHindi: "विधवा पेंशन योजना",
    category: "women",
    level: "central",
    benefit: "₹300–₹1,500/month pension for widows below poverty line",
    benefitHindi: "₹300–₹1,500 प्रतिमाह विधवा पेंशन",
    eligibility: {
      occupation: ["all"],
      income_max: 200000,
      caste: ["all"],
      age_min: 18,
      age_max: 59,
      gender: "female",
      states: ["all"],
      widow: true,
    },
    documents: ["Aadhaar", "Husband's Death Certificate", "Income Certificate", "Bank Passbook"],
    apply_url: "https://nsap.nic.in",
    apply_mode: ["Gram Panchayat / Municipal Office", "District Social Welfare Department"],
    emoji: "👩",
    match_keywords: ["widow", "vidhwa", "pati ka mrityu", "husband died", "alone woman"],
  },
];

// Profile extraction helper - matches profile to schemes
export function matchSchemes(profile) {
  const scored = schemes.map((scheme) => {
    let score = 0;
    let reasons = [];

    const el = scheme.eligibility;

    // Occupation check
    if (el.occupation.includes("all") || (profile.occupation && el.occupation.some(o => profile.occupation.toLowerCase().includes(o)))) {
      score += 30;
      reasons.push("Occupation matches");
    } else if (profile.occupation) {
      // fuzzy match on keywords
      const matchKw = scheme.match_keywords.some(kw => profile.raw_text?.toLowerCase().includes(kw));
      if (matchKw) { score += 20; reasons.push("Related activity"); }
    }

    // Income check
    if (!el.income_max || !profile.income || profile.income <= el.income_max) {
      score += 20;
      reasons.push("Income eligible");
    } else {
      return { ...scheme, score: 0, reasons: ["Income too high"] };
    }

    // Caste check
    if (el.caste.includes("all") || (profile.caste && el.caste.some(c => c.toLowerCase() === profile.caste.toLowerCase()))) {
      score += 15;
      reasons.push("Category matches");
    }

    // Age check
    const age = profile.age;
    if (age) {
      if (el.age_min && age < el.age_min) return { ...scheme, score: 0, reasons: ["Age requirement not met"] };
      if (el.age_max && age > el.age_max) return { ...scheme, score: 0, reasons: ["Age requirement not met"] };
      score += 10;
    } else {
      score += 5; // partial credit
    }

    // Gender check
    if (el.gender === "all" || !profile.gender || el.gender === profile.gender) {
      score += 10;
    } else {
      return { ...scheme, score: 0, reasons: ["Gender specific scheme"] };
    }

    // Special flags
    if (el.widow && profile.widow) { score += 20; reasons.push("Widow status matches"); }
    if (el.bpl_card && profile.bpl) { score += 15; reasons.push("BPL card holder"); }

    // Keyword bonus
    if (profile.raw_text) {
      const kwMatches = scheme.match_keywords.filter(kw => profile.raw_text.toLowerCase().includes(kw)).length;
      score += kwMatches * 5;
    }

    return { ...scheme, score: Math.min(score, 99), reasons };
  });

  return scored
    .filter(s => s.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
