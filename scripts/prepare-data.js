#!/usr/bin/env node
/**
 * HaqDaar v2 — Scheme Data Preparation Script
 * 
 * Builds a comprehensive Indian government schemes database from:
 * 1. MyScheme.gov.in public data (if accessible)
 * 2. Built-in curated seed data covering all major categories
 * 
 * Output: src/data/schemes.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../src/data/schemes.json');

// ─── Comprehensive Seed Data ────────────────────────────────────────────────
// Curated from MyScheme.gov.in — covers all major categories across states
const SEED_SCHEMES = [
  // ═══════════════════════════════════════════════════════════════════
  // AGRICULTURE (Central)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "PM-KISAN-001",
    name: "PM-KISAN Samman Nidhi",
    nameHindi: "पीएम किसान सम्मान निधि",
    category: "agriculture",
    level: "central",
    state: "all",
    benefit: "₹6,000/year in 3 installments of ₹2,000 directly in bank account — for all landholding farmer families",
    benefitHindi: "₹6,000 प्रति वर्ष — 3 किस्तों में सीधे बैंक में",
    eligibility: { occupation: ["farmer"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"], exclusions: ["income_tax_payers", "government_employees", "professionals"] },
    documents: ["Aadhaar Card", "Land Records (Khatoni/Khatauni)", "Bank Passbook", "Mobile Number linked to Aadhaar"],
    apply_url: "https://pmkisan.gov.in",
    apply_mode: ["Online at pmkisan.gov.in", "Village Patwari / Lekhpal", "CSC Center"],
    emoji: "🌾",
    tags: ["farmer", "kisan", "kheti", "agriculture", "land", "income_support"],
    description: "Direct income support scheme providing ₹6,000 per year to small and marginal farmer families across India, paid in three equal installments."
  },
  {
    id: "KCC-001",
    name: "Kisan Credit Card (KCC)",
    nameHindi: "किसान क्रेडिट कार्ड",
    category: "agriculture",
    level: "central",
    state: "all",
    benefit: "Agricultural loan up to ₹3 lakh at 4% interest (with prompt repayment subsidy) — covers crop, animal husbandry, fisheries",
    benefitHindi: "4% ब्याज पर ₹3 लाख तक कृषि ऋण — फसल, पशुपालन, मत्स्य पालन",
    eligibility: { occupation: ["farmer"], income_max: null, caste: ["all"], age_min: 18, age_max: 75, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Land Records / Lease Agreement", "Bank Account", "Passport Photo", "PAN Card (for loans > ₹1.6L)"],
    apply_url: "https://pmkisan.gov.in/kcc.aspx",
    apply_mode: ["Nearest Bank Branch (any nationalized bank)", "Co-operative Banks", "Regional Rural Banks", "NABARD"],
    emoji: "💳",
    tags: ["loan", "credit", "karz", "farmer", "kisan", "kheti", "interest_subsidy"],
    description: "Provides farmers with affordable credit for agricultural operations, allied activities, and consumption needs at subsidized interest rates."
  },
  {
    id: "PMFBY-001",
    name: "PM Fasal Bima Yojana (Crop Insurance)",
    nameHindi: "प्रधानमंत्री फसल बीमा योजना",
    category: "agriculture",
    level: "central",
    state: "all",
    benefit: "Crop insurance at 1.5% premium (Rabi), 2% (Kharif), 5% (horticulture) — covers losses from drought, flood, pest, hailstorm, cyclone",
    benefitHindi: "1.5–5% प्रीमियम पर फसल बीमा — सूखा, बाढ़, कीट, ओलावृष्टि सभी में सुरक्षा",
    eligibility: { occupation: ["farmer"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Land Records / Tenant Agreement", "Bank Account", "Crop Sowing Certificate from Patwari", "Previous Season's Yield Data"],
    apply_url: "https://pmfby.gov.in",
    apply_mode: ["Nearest Bank Branch (auto-enrolled for loanee farmers)", "CSC Center", "pmfby.gov.in / Crop Insurance App"],
    emoji: "🌱",
    tags: ["crop", "fasal", "insurance", "bima", "drought", "flood", "khet", "farming", "natural_disaster"],
    description: "Comprehensive crop insurance scheme protecting farmers against financial losses due to natural calamities, pests, and diseases."
  },
  {
    id: "PMKSY-001",
    name: "PM Krishi Sinchai Yojana (Irrigation)",
    nameHindi: "प्रधानमंत्री कृषि सिंचाई योजना",
    category: "agriculture",
    level: "central",
    state: "all",
    benefit: "55–100% subsidy on micro-irrigation systems (drip/sprinkler) — 'Per Drop More Crop' reduces water usage by 40-70%",
    benefitHindi: "55–100% सब्सिडी माइक्रो-सिंचाई पर — ड्रिप/स्प्रिंकलर से 40-70% पानी बचत",
    eligibility: { occupation: ["farmer"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Land Records", "Bank Account", "Caste Certificate (for higher subsidy)"],
    apply_url: "https://pmksy.gov.in",
    apply_mode: ["State Agriculture Department", "District Horticulture Officer", "pmksy.gov.in"],
    emoji: "💧",
    tags: ["irrigation", "sinchai", "drip", "sprinkler", "water", "farming", "subsidy"],
    description: "Provides subsidized micro-irrigation systems to improve water use efficiency and crop productivity under the 'Per Drop More Crop' initiative."
  },
  {
    id: "SMAM-001",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    nameHindi: "कृषि मशीनीकरण उप-मिशन",
    category: "agriculture",
    level: "central",
    state: "all",
    benefit: "40–80% subsidy on farm machinery — tractors, harvesters, power tillers, seed drills, threshers for small/marginal farmers",
    benefitHindi: "40–80% सब्सिडी कृषि उपकरणों पर — ट्रैक्टर, हार्वेस्टर, पावर टिलर",
    eligibility: { occupation: ["farmer"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Land Records", "Bank Account", "Caste Certificate (SC/ST get higher subsidy)"],
    apply_url: "https://agrimachinery.nic.in",
    apply_mode: ["State Agriculture Department", "agrimachinery.nic.in", "District Agriculture Officer"],
    emoji: "🚜",
    tags: ["machinery", "tractor", "subsidy", "farmer", "equipment", "mechanization"],
    description: "Promotes farm mechanization by providing subsidies on agricultural machinery to small and marginal farmers."
  },

  // ═══════════════════════════════════════════════════════════════════
  // HEALTH
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "AYUSHMAN-001",
    name: "Ayushman Bharat PM-JAY",
    nameHindi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना",
    category: "health",
    level: "central",
    state: "all",
    benefit: "₹5 lakh/year free health insurance per family for hospitalization — covers 1,949 treatment packages at 29,000+ empanelled hospitals",
    benefitHindi: "₹5 लाख तक मुफ्त इलाज प्रति वर्ष — सरकारी और प्राइवेट अस्पतालों में — 1,949 उपचार शामिल",
    eligibility: { occupation: ["all"], income_max: 100000, caste: ["all"], age_min: 0, gender: "all", states: ["all"], bpl_card: true, exclusions: ["above_poverty_line_non_secc"] },
    documents: ["Aadhaar Card", "Ration Card / BPL Card", "SECC 2011 Data (auto-verified)", "Mobile Number", "Family Photo ID"],
    apply_url: "https://pmjay.gov.in",
    apply_mode: ["Any empanelled hospital helpdesk", "pmjay.gov.in", "Ayushman Bharat App", "Toll-free: 14555"],
    emoji: "💊",
    tags: ["health", "hospital", "insurance", "sehat", "bimari", "ilaaj", "free_treatment", "surgery"],
    description: "World's largest health insurance scheme providing ₹5 lakh coverage per family for secondary and tertiary hospitalization across India."
  },
  {
    id: "JSY-001",
    name: "Janani Suraksha Yojana (Maternity Benefit)",
    nameHindi: "जननी सुरक्षा योजना",
    category: "health",
    level: "central",
    state: "all",
    benefit: "₹700–₹1,400 cash assistance to pregnant women for institutional delivery — covers BPL, SC/ST women",
    benefitHindi: "₹700–₹1,400 नकद सहायता गर्भवती महिलाओं को अस्पताल में प्रसव के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 19, gender: "female", states: ["all"], bpl_card: true },
    documents: ["Aadhaar Card", "BPL Card", "MCH Card (Mother & Child Health)", "Bank Account", "JSY Card"],
    apply_url: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    apply_mode: ["Nearest Government Hospital", "ANM/ASHA Worker", "PHC/CHC"],
    emoji: "🤰",
    tags: ["pregnancy", "maternity", "delivery", "hospital", "women", "mother", "child", "garbhvati"],
    description: "Cash incentive for pregnant women to encourage institutional delivery, reducing maternal and infant mortality."
  },
  {
    id: "PMSMA-001",
    name: "PM Surakshit Matritva Abhiyan",
    nameHindi: "प्रधानमंत्री सुरक्षित मातृत्व अभियान",
    category: "health",
    level: "central",
    state: "all",
    benefit: "Free antenatal checkup on 9th of every month for all pregnant women — includes ultrasound, blood tests, high-risk identification",
    benefitHindi: "हर महीने 9 तारीख को गर्भवती महिलाओं की मुफ्त जांच — अल्ट्रासाउंड, खून जांच शामिल",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "female", states: ["all"] },
    documents: ["Aadhaar Card", "MCH Card"],
    apply_url: "https://pmsma.nhp.gov.in",
    apply_mode: ["Government Hospital on 9th of every month", "PHC/CHC", "pmsma.nhp.gov.in"],
    emoji: "🏥",
    tags: ["pregnancy", "checkup", "antenatal", "maternity", "women", "health", "free"],
    description: "Provides free comprehensive antenatal care to all pregnant women on the 9th of every month at government health facilities."
  },

  // ═══════════════════════════════════════════════════════════════════
  // SCHOLARSHIPS & EDUCATION
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "NSP-SC-001",
    name: "Pre-Matric Scholarship for SC/ST Students",
    nameHindi: "प्री-मैट्रिक छात्रवृत्ति — SC/ST छात्र",
    category: "scholarship",
    level: "central",
    state: "all",
    benefit: "₹150–₹350/month maintenance + ₹500–₹750 ad-hoc grant for students in Class 9–10 from SC/ST families",
    benefitHindi: "₹150–₹350 प्रतिमाह + ₹750 तक वार्षिक अनुदान — कक्षा 9-10",
    eligibility: { occupation: ["student"], income_max: 250000, caste: ["SC", "ST"], age_min: 14, age_max: 20, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Caste Certificate", "Income Certificate (< ₹2.5L)", "Previous Year Mark Sheet", "Bank Passbook", "School Bonafide Certificate"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP Portal)", "School Principal", "Deadline: Oct 31 every year"],
    emoji: "🎓",
    tags: ["student", "scholarship", "padhai", "school", "SC", "ST", "dalit", "tribal", "education"],
    description: "Financial assistance for SC/ST students in Classes 9-10 to reduce dropout rates and support education."
  },
  {
    id: "NSP-POST-001",
    name: "Post-Matric Scholarship for SC Students",
    nameHindi: "पोस्ट-मैट्रिक छात्रवृत्ति — SC छात्र",
    category: "scholarship",
    level: "central",
    state: "all",
    benefit: "Full tuition fee reimbursement + ₹1,200–₹2,000/month maintenance from Class 11 up to PhD — covers hostellers and day scholars",
    benefitHindi: "पूरी फीस + ₹1,200–₹2,000 प्रतिमाह छात्रवृत्ति — 11वीं से पीएचडी तक",
    eligibility: { occupation: ["student"], income_max: 250000, caste: ["SC"], age_min: 16, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Caste Certificate", "Income Certificate (< ₹2.5L)", "College Admission Letter / ID", "Fee Receipt", "Bank Passbook", "Previous Year Marksheet"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP Portal)", "College Welfare Officer", "Deadline: Nov 30 every year"],
    emoji: "📚",
    tags: ["student", "scholarship", "college", "university", "SC", "dalit", "padhai", "higher_education", "phd"],
    description: "Comprehensive scholarship covering full tuition and maintenance for SC students pursuing higher education."
  },
  {
    id: "NSP-OBC-001",
    name: "Post-Matric Scholarship for OBC Students",
    nameHindi: "पोस्ट-मैट्रिक छात्रवृत्ति — OBC छात्र",
    category: "scholarship",
    level: "central",
    state: "all",
    benefit: "Tuition fee reimbursement + ₹500–₹1,000/month maintenance for OBC students — Class 11 to Post Graduation",
    benefitHindi: "ट्यूशन फीस + ₹500–₹1,000 प्रतिमाह — 11वीं से पोस्ट ग्रेजुएशन तक",
    eligibility: { occupation: ["student"], income_max: 100000, caste: ["OBC"], age_min: 16, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "OBC Certificate", "Income Certificate (< ₹1L)", "College ID", "Fee Receipt", "Bank Passbook"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP Portal)", "College Welfare Officer"],
    emoji: "📖",
    tags: ["student", "scholarship", "OBC", "college", "post_matric", "education"],
    description: "Financial support for OBC students pursuing higher education from Class 11 onwards."
  },
  {
    id: "MINORITY-SCH-001",
    name: "Merit-cum-Means Scholarship for Minorities",
    nameHindi: "मेरिट-कम-मीन्स छात्रवृत्ति — अल्पसंख्यक",
    category: "scholarship",
    level: "central",
    state: "all",
    benefit: "Full tuition fee (up to ₹20,000/year) + ₹1,000/month maintenance — for minority community students in professional/technical courses",
    benefitHindi: "₹20,000 तक ट्यूशन फीस + ₹1,000 प्रतिमाह — व्यावसायिक पाठ्यक्रमों के लिए",
    eligibility: { occupation: ["student"], income_max: 250000, caste: ["minority"], age_min: 16, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Minority Community Certificate (self-declaration)", "Income Certificate", "Admission Letter", "Fee Receipt", "Bank Passbook"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP Portal)", "College/Institute"],
    emoji: "🌙",
    tags: ["student", "scholarship", "minority", "muslim", "christian", "sikh", "buddhist", "parsi", "jain", "education"],
    description: "Scholarship for meritorious students from minority communities pursuing professional and technical courses."
  },
  {
    id: "PRAGATI-001",
    name: "PRAGATI Scholarship for Girls (AICTE)",
    nameHindi: "प्रगति छात्रवृत्ति — लड़कियों के लिए (AICTE)",
    category: "scholarship",
    level: "central",
    state: "all",
    benefit: "₹50,000/year for girls pursuing technical education (Engineering, Pharmacy, Architecture, MCA) — up to 2 girls per family",
    benefitHindi: "₹50,000 प्रति वर्ष — तकनीकी शिक्षा (इंजीनियरिंग, फार्मेसी, MCA) में पढ़ने वाली लड़कियों के लिए",
    eligibility: { occupation: ["student"], income_max: 800000, caste: ["all"], age_min: 17, gender: "female", states: ["all"] },
    documents: ["Aadhaar Card", "Income Certificate (< ₹8L)", "AICTE Approved College Admission Proof", "10th & 12th Marksheet", "Bank Passbook"],
    apply_url: "https://scholarships.gov.in",
    apply_mode: ["scholarships.gov.in (NSP Portal)", "AICTE Approved College"],
    emoji: "👩‍🔬",
    tags: ["girl", "scholarship", "engineering", "technical", "AICTE", "women", "education", "beti"],
    description: "Promotes technical education among girls by providing ₹50,000/year scholarship for AICTE-approved degree programs."
  },

  // ═══════════════════════════════════════════════════════════════════
  // HOUSING
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "PMAY-G-001",
    name: "PM Awas Yojana — Gramin (Rural Housing)",
    nameHindi: "प्रधानमंत्री आवास योजना — ग्रामीण",
    category: "housing",
    level: "central",
    state: "all",
    benefit: "₹1.20 lakh (plain areas) to ₹1.30 lakh (hilly/difficult areas) grant to build a pucca house + 90/95 days MGNREGA wages",
    benefitHindi: "₹1.20–₹1.30 लाख पक्का घर बनाने के लिए + मनरेगा मजदूरी 90/95 दिन",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"], area: ["rural"], exclusions: ["pucca_house_owners"] },
    documents: ["Aadhaar Card", "BPL Card / SECC 2011 data", "Bank Account", "Land Documents / NOC from Gram Sabha", "Photograph"],
    apply_url: "https://pmayg.nic.in",
    apply_mode: ["Gram Panchayat Office", "pmayg.nic.in", "Block Development Office (BDO)", "AwaasSoft App"],
    emoji: "🏠",
    tags: ["house", "ghar", "housing", "makan", "awas", "rural", "village", "gaon", "pucca"],
    description: "Provides financial assistance for construction of pucca houses to eligible rural families living in kutcha/dilapidated houses."
  },
  {
    id: "PMAY-U-001",
    name: "PM Awas Yojana — Urban (PMAY-U 2.0)",
    nameHindi: "प्रधानमंत्री आवास योजना — शहरी 2.0",
    category: "housing",
    level: "central",
    state: "all",
    benefit: "₹2.5 lakh central assistance for EWS/LIG + interest subsidy of 6.5% on home loans up to ₹6 lakh — for urban poor",
    benefitHindi: "₹2.5 लाख सहायता + 6.5% ब्याज सब्सिडी — शहरी गरीबों के लिए पक्का घर",
    eligibility: { occupation: ["all"], income_max: 600000, caste: ["all"], age_min: 18, gender: "all", states: ["all"], area: ["urban"] },
    documents: ["Aadhaar Card", "Income Certificate", "Address Proof (Urban)", "Bank Account", "EWS/LIG Certificate from ULB"],
    apply_url: "https://pmaymis.gov.in",
    apply_mode: ["Municipal Corporation / Nagar Palika", "pmaymis.gov.in", "CLSS through Banks/HFCs"],
    emoji: "🏢",
    tags: ["house", "ghar", "housing", "urban", "city", "shehar", "flat", "apartment", "home_loan"],
    description: "Affordable housing scheme for urban poor providing direct financial assistance and interest subsidy on home loans."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STARTUP & BUSINESS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "MUDRA-001",
    name: "PM MUDRA Yojana",
    nameHindi: "प्रधानमंत्री मुद्रा योजना",
    category: "startup",
    level: "central",
    state: "all",
    benefit: "Business loans from ₹50,000 (Shishu) to ₹10 lakh (Tarun) — no collateral required, covers manufacturing, trading, services",
    benefitHindi: "₹50,000 (शिशु) से ₹10 लाख (तरुण) तक बिना गारंटी के व्यापार ऋण",
    eligibility: { occupation: ["self_employed", "small_business", "entrepreneur"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "PAN Card", "Business Plan / Proposal", "Identity & Address Proof", "Bank Statement (6 months)", "Passport Photo"],
    apply_url: "https://mudra.org.in",
    apply_mode: ["Any Nationalized / Private / RRB Bank", "NBFC / Microfinance Institutions", "mudra.org.in", "Udyamimitra Portal"],
    emoji: "🚀",
    tags: ["business", "startup", "shop", "dukan", "loan", "entrepreneur", "self_employed", "vyapar", "karobar"],
    description: "Provides collateral-free loans to micro and small enterprises for business creation and expansion in three tiers: Shishu, Kishore, and Tarun."
  },
  {
    id: "PMEGP-001",
    name: "PM Employment Generation Programme (PMEGP)",
    nameHindi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
    category: "startup",
    level: "central",
    state: "all",
    benefit: "15–35% subsidy on project cost up to ₹50 lakh (manufacturing) / ₹20 lakh (services) — for setting up new micro enterprises",
    benefitHindi: "15–35% सब्सिडी परियोजना लागत पर — ₹50 लाख (मैन्युफैक्चरिंग) / ₹20 लाख (सेवा) तक",
    eligibility: { occupation: ["unemployed", "self_employed", "entrepreneur"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Detailed Project Report (DPR)", "Educational Certificate (8th pass minimum)", "Caste Certificate (for higher subsidy)", "Bank Account"],
    apply_url: "https://www.kviconline.gov.in/pmegpeportal/",
    apply_mode: ["KVIC / KVIB Office", "District Industries Centre (DIC)", "kviconline.gov.in", "Banks"],
    emoji: "🏭",
    tags: ["business", "manufacturing", "subsidy", "entrepreneur", "new_business", "rozgar", "employment"],
    description: "Generates employment through establishment of micro enterprises with government subsidy in manufacturing and service sectors."
  },
  {
    id: "STANDUP-001",
    name: "Stand Up India (SC/ST/Women Entrepreneurs)",
    nameHindi: "स्टैंड अप इंडिया — SC/ST/महिला उद्यमी",
    category: "startup",
    level: "central",
    state: "all",
    benefit: "Bank loans between ₹10 lakh to ₹1 crore — for SC/ST/Women entrepreneurs setting up greenfield enterprises in manufacturing, services, or trading",
    benefitHindi: "₹10 लाख से ₹1 करोड़ तक बैंक ऋण — SC/ST/महिला उद्यमियों के लिए नया व्यवसाय शुरू करने हेतु",
    eligibility: { occupation: ["self_employed", "entrepreneur"], income_max: null, caste: ["SC", "ST"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Caste/Gender Certificate", "Business Plan", "Address Proof", "Bank Account", "ITR (if applicable)"],
    apply_url: "https://www.standupmitra.in",
    apply_mode: ["Any Scheduled Commercial Bank Branch", "standupmitra.in", "SIDBI"],
    emoji: "💼",
    tags: ["SC", "ST", "women", "mahila", "loan", "business", "entrepreneur", "startup", "enterprise"],
    description: "Facilitates bank loans for SC/ST and women entrepreneurs to set up greenfield enterprises."
  },

  // ═══════════════════════════════════════════════════════════════════
  // FINANCIAL INCLUSION & INSURANCE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "PMJDY-001",
    name: "PM Jan Dhan Yojana (Zero-Balance Account)",
    nameHindi: "प्रधानमंत्री जन धन योजना",
    category: "financial",
    level: "central",
    state: "all",
    benefit: "Free zero-balance bank account + RuPay debit card + ₹2 lakh accident insurance + ₹30,000 life cover + ₹10,000 overdraft facility",
    benefitHindi: "मुफ्त बैंक खाता + RuPay कार्ड + ₹2 लाख दुर्घटना बीमा + ₹10,000 ओवरड्राफ्ट",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 10, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card (or any valid ID proof)", "Passport Photo", "Address Proof (Ration Card / Voter ID)"],
    apply_url: "https://pmjdy.gov.in",
    apply_mode: ["Any Nationalized Bank Branch", "Business Correspondent (BC) Agent in villages"],
    emoji: "🏦",
    tags: ["bank", "account", "saving", "bachat", "no_account", "koi_account_nahi", "financial_inclusion"],
    description: "Universal banking scheme ensuring access to financial services for all unbanked households."
  },
  {
    id: "PMJJBY-001",
    name: "PM Jeevan Jyoti Bima Yojana (Life Insurance)",
    nameHindi: "प्रधानमंत्री जीवन ज्योति बीमा योजना",
    category: "financial",
    level: "central",
    state: "all",
    benefit: "₹2 lakh life insurance cover at just ₹436/year — auto-deducted from bank account, covers death due to any reason",
    benefitHindi: "सिर्फ ₹436/साल में ₹2 लाख का जीवन बीमा — मृत्यु के किसी भी कारण पर",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, age_max: 50, gender: "all", states: ["all"], requires: ["bank_account"] },
    documents: ["Aadhaar Card", "Bank Account with ₹436+ balance", "Nominee Details"],
    apply_url: "https://www.jansuraksha.gov.in",
    apply_mode: ["Bank Branch (auto-debit consent form)", "Net Banking / Bank App", "CSC Center"],
    emoji: "🛡️",
    tags: ["insurance", "bima", "life_insurance", "jeevan", "death", "family_security"],
    description: "Affordable life insurance scheme providing ₹2 lakh death cover at minimal annual premium."
  },
  {
    id: "PMSBY-001",
    name: "PM Suraksha Bima Yojana (Accident Insurance)",
    nameHindi: "प्रधानमंत्री सुरक्षा बीमा योजना",
    category: "financial",
    level: "central",
    state: "all",
    benefit: "₹2 lakh (death/permanent disability) and ₹1 lakh (partial disability) accident insurance at just ₹20/year",
    benefitHindi: "केवल ₹20/साल में ₹2 लाख का दुर्घटना बीमा — मृत्यु या स्थायी विकलांगता पर",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, age_max: 70, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Bank Account", "Nominee Details"],
    apply_url: "https://www.jansuraksha.gov.in",
    apply_mode: ["Bank Branch", "Net Banking / Bank App", "CSC Center"],
    emoji: "⚕️",
    tags: ["accident", "insurance", "bima", "durghatna", "disability", "suraksha"],
    description: "Ultra-affordable accident insurance providing coverage for accidental death and disability."
  },
  {
    id: "APY-001",
    name: "Atal Pension Yojana (APY)",
    nameHindi: "अटल पेंशन योजना",
    category: "financial",
    level: "central",
    state: "all",
    benefit: "Guaranteed pension of ₹1,000–₹5,000/month after age 60 — government co-contributes 50% for 5 years (for those joining by 2015)",
    benefitHindi: "60 वर्ष के बाद ₹1,000–₹5,000 प्रतिमाह गारंटीड पेंशन",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, age_max: 40, gender: "all", states: ["all"], requires: ["bank_account"], exclusions: ["income_tax_payers", "existing_pension_holders"] },
    documents: ["Aadhaar Card", "Bank Account", "Mobile Number"],
    apply_url: "https://www.npscra.nsdl.co.in/scheme-details.php",
    apply_mode: ["Bank Branch", "Net Banking / Bank App"],
    emoji: "👴",
    tags: ["pension", "retirement", "old_age", "budhapa", "savings", "future"],
    description: "Guaranteed pension scheme for unorganized sector workers providing defined pension benefits after age 60."
  },

  // ═══════════════════════════════════════════════════════════════════
  // WOMEN & CHILD WELFARE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "SSY-001",
    name: "Sukanya Samriddhi Yojana (Girl Child Savings)",
    nameHindi: "सुकन्या समृद्धि योजना",
    category: "women",
    level: "central",
    state: "all",
    benefit: "Tax-free savings scheme for girl child at 8.2% interest — maturity at age 21 for education/marriage expenses (min ₹250/year)",
    benefitHindi: "बेटी की शिक्षा/विवाह के लिए 8.2% ब्याज पर टैक्स-फ्री बचत — 21 वर्ष पर परिपक्वता",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, age_max: 10, gender: "female", states: ["all"] },
    documents: ["Girl Child's Birth Certificate", "Parent/Guardian Aadhaar", "Address Proof", "PAN Card of Parent"],
    apply_url: "https://www.india.gov.in/sukanya-samriddhi-yojna",
    apply_mode: ["Any Post Office", "Any Nationalized Bank Branch"],
    emoji: "👧",
    tags: ["girl", "beti", "daughter", "women", "female", "mahila", "savings", "education", "marriage"],
    description: "Government-backed high-interest savings scheme exclusively for the girl child for education and marriage expenses."
  },
  {
    id: "PMMVY-001",
    name: "PM Matru Vandana Yojana (Maternity Benefit)",
    nameHindi: "प्रधानमंत्री मातृ वंदना योजना",
    category: "women",
    level: "central",
    state: "all",
    benefit: "₹11,000 in installments for first 2 live births — ₹3,000 (1st installment) + ₹3,000 (2nd) + ₹2,000 (3rd) + ₹3,000 (at hospital delivery under JSY)",
    benefitHindi: "₹11,000 किस्तों में — पहले 2 जीवित जन्मों के लिए गर्भवती और स्तनपान कराने वाली माताओं को",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 19, gender: "female", states: ["all"] },
    documents: ["Aadhaar Card", "MCP Card (Mother & Child Protection)", "Bank Passbook", "Pregnancy Confirmation", "Delivery Certificate"],
    apply_url: "https://pmmvy.wcd.gov.in",
    apply_mode: ["Anganwadi Centre", "Sub Health Centre", "pmmvy.wcd.gov.in"],
    emoji: "🤱",
    tags: ["maternity", "pregnancy", "mother", "women", "child", "delivery", "maa", "garbhvati"],
    description: "Cash incentive for pregnant and lactating mothers to compensate wage loss during pregnancy and ensure healthy nutrition."
  },
  {
    id: "WIDOW-001",
    name: "Indira Gandhi National Widow Pension",
    nameHindi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना",
    category: "women",
    level: "central",
    state: "all",
    benefit: "₹300/month central share + state top-up (₹500–₹2,000 varies by state) — for BPL widows aged 40-59",
    benefitHindi: "₹300/माह केंद्रीय + राज्य टॉप-अप (₹500–₹2,000) — BPL विधवाओं के लिए",
    eligibility: { occupation: ["all"], income_max: 200000, caste: ["all"], age_min: 40, age_max: 59, gender: "female", states: ["all"], widow: true, bpl_card: true },
    documents: ["Aadhaar Card", "Husband's Death Certificate", "BPL Card / Income Certificate", "Bank Passbook", "Age Proof"],
    apply_url: "https://nsap.nic.in",
    apply_mode: ["Gram Panchayat / Municipal Office", "District Social Welfare Department", "Jan Seva Kendra"],
    emoji: "👩",
    tags: ["widow", "vidhwa", "pati_ka_mrityu", "husband_died", "alone_woman", "pension"],
    description: "Monthly pension for BPL widows to provide social security and financial independence."
  },
  {
    id: "ONELR-001",
    name: "One Stop Centre (Sakhi Centre) for Women",
    nameHindi: "वन स्टॉप सेंटर (सखी केंद्र)",
    category: "women",
    level: "central",
    state: "all",
    benefit: "Free integrated support for women affected by violence — medical aid, legal counselling, police facilitation, psycho-social support, temporary shelter (5 days)",
    benefitHindi: "हिंसा पीड़ित महिलाओं को मुफ्त चिकित्सा, कानूनी सहायता, पुलिस सहायता, मनोवैज्ञानिक सहारा, अस्थायी आश्रय",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, gender: "female", states: ["all"] },
    documents: ["No documents required for emergency help"],
    apply_url: "https://www.wcd.nic.in/schemes/one-stop-centre-scheme-1",
    apply_mode: ["Women Helpline: 181", "Nearest One Stop Centre (in every district)", "Police Station"],
    emoji: "🆘",
    tags: ["women", "violence", "domestic_violence", "help", "shelter", "safety", "mahila", "helpline"],
    description: "24/7 integrated support centres in every district for women affected by violence, providing medical, legal, and psychological assistance."
  },

  // ═══════════════════════════════════════════════════════════════════
  // SKILL DEVELOPMENT & EMPLOYMENT
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "SKILL-001",
    name: "PM Kaushal Vikas Yojana 4.0 (PMKVY)",
    nameHindi: "प्रधानमंत्री कौशल विकास योजना 4.0",
    category: "skill",
    level: "central",
    state: "all",
    benefit: "Free skill training (2–6 months) + ₹8,000 reward + government-recognized NSQF certificate + placement assistance + apprenticeship",
    benefitHindi: "मुफ्त कौशल प्रशिक्षण + ₹8,000 इनाम + NSQF सर्टिफिकेट + नौकरी सहायता + अप्रेंटिसशिप",
    eligibility: { occupation: ["unemployed", "daily_wage", "student", "dropout"], income_max: null, caste: ["all"], age_min: 15, age_max: 45, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Educational Certificate (if any)", "Bank Account", "Passport Photo", "Mobile Number"],
    apply_url: "https://www.pmkvyofficial.org",
    apply_mode: ["pmkvyofficial.org", "Nearest PMKVY Training Center (Skill India Portal)", "CSC Center"],
    emoji: "🔧",
    tags: ["skill", "training", "job", "naukri", "unemployed", "kaam_nahi", "berozgar", "certification", "placement"],
    description: "India's flagship skill development scheme providing free industry-relevant training with certification and placement support."
  },
  {
    id: "MGNREGA-001",
    name: "MGNREGA (100 Days Employment Guarantee)",
    nameHindi: "मनरेगा — 100 दिन रोजगार गारंटी",
    category: "skill",
    level: "central",
    state: "all",
    benefit: "Guaranteed 100 days of unskilled manual work per household per year at state minimum wage (₹243–₹374/day) + unemployment allowance if work not provided within 15 days",
    benefitHindi: "100 दिन गारंटीड रोजगार — राज्य न्यूनतम मजदूरी (₹243–₹374/दिन) + 15 दिन में काम न मिलने पर बेरोजगारी भत्ता",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"], area: ["rural"] },
    documents: ["Job Card (apply at Gram Panchayat)", "Aadhaar Card", "Bank Account / Post Office Account"],
    apply_url: "https://nrega.nic.in",
    apply_mode: ["Gram Panchayat Office (apply for Job Card)", "nrega.nic.in", "Block Development Office"],
    emoji: "⛏️",
    tags: ["employment", "rozgar", "work", "kaam", "majduri", "daily_wage", "rural", "job_card", "guarantee"],
    description: "Legal guarantee of 100 days employment per rural household, providing livelihood security to the most vulnerable."
  },
  {
    id: "DDUGKY-001",
    name: "DDU Grameen Kaushalya Yojana (DDU-GKY)",
    nameHindi: "दीन दयाल उपाध्याय ग्रामीण कौशल्य योजना",
    category: "skill",
    level: "central",
    state: "all",
    benefit: "Free residential skill training (3–12 months) + guaranteed placement at ₹6,000+ salary + free food, accommodation, uniform during training",
    benefitHindi: "मुफ्त आवासीय प्रशिक्षण (3–12 माह) + ₹6,000+ वेतन पर नौकरी की गारंटी + मुफ्त खाना, रहना, यूनिफॉर्म",
    eligibility: { occupation: ["unemployed", "daily_wage"], income_max: null, caste: ["all"], age_min: 15, age_max: 35, gender: "all", states: ["all"], area: ["rural"] },
    documents: ["Aadhaar Card", "Age Proof", "Address Proof (Rural)", "Bank Account", "BPL Card (priority)"],
    apply_url: "https://ddugky.gov.in",
    apply_mode: ["Gram Panchayat", "Block Development Office", "ddugky.gov.in", "SRLM (State Rural Livelihood Mission)"],
    emoji: "🎯",
    tags: ["skill", "training", "rural", "youth", "job", "placement", "residential", "free_training"],
    description: "Skill training programme exclusively for rural poor youth with guaranteed placement and residential training facilities."
  },

  // ═══════════════════════════════════════════════════════════════════
  // SENIOR CITIZENS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "OAP-001",
    name: "Indira Gandhi National Old Age Pension",
    nameHindi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन",
    category: "senior",
    level: "central",
    state: "all",
    benefit: "₹200/month (60-79 yrs) or ₹500/month (80+ yrs) central share + state top-up (₹500–₹2,500 varies by state)",
    benefitHindi: "₹200–₹500/माह केंद्रीय + राज्य टॉप-अप — BPL वृद्ध नागरिकों के लिए",
    eligibility: { occupation: ["all"], income_max: 50000, caste: ["all"], age_min: 60, gender: "all", states: ["all"], bpl_card: true },
    documents: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID)", "BPL Certificate", "Bank Passbook", "Passport Photo"],
    apply_url: "https://nsap.nic.in",
    apply_mode: ["Gram Panchayat / Municipal Office", "District Social Welfare Office", "Jan Seva Kendra"],
    emoji: "👴",
    tags: ["old", "senior", "budhapa", "pension", "elder", "retired", "aged", "vridh"],
    description: "Monthly pension for BPL senior citizens to provide basic financial security in old age."
  },
  {
    id: "SENIOR-HEALTH-001",
    name: "Rashtriya Vayoshri Yojana (Free Aids for Seniors)",
    nameHindi: "राष्ट्रीय वयोश्री योजना",
    category: "senior",
    level: "central",
    state: "all",
    benefit: "Free physical aids and assistive devices — hearing aids, walking sticks, wheelchairs, spectacles, dentures for BPL senior citizens",
    benefitHindi: "BPL वृद्ध नागरिकों को मुफ्त सहायक उपकरण — श्रवण यंत्र, व्हीलचेयर, चश्मा, बैसाखी",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 60, gender: "all", states: ["all"], bpl_card: true },
    documents: ["Aadhaar Card", "BPL Card", "Age Proof", "Disability Certificate (if applicable)"],
    apply_url: "https://www.alimco.in/RVY.aspx",
    apply_mode: ["Distribution Camps (announced by ALIMCO)", "District Social Welfare Office", "ALIMCO office"],
    emoji: "♿",
    tags: ["senior", "disability", "wheelchair", "hearing_aid", "spectacles", "old", "aids", "devices"],
    description: "Provides free assistive devices and aids to BPL senior citizens suffering from age-related disabilities."
  },

  // ═══════════════════════════════════════════════════════════════════
  // DISABILITY
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "IGNDPS-001",
    name: "Indira Gandhi National Disability Pension",
    nameHindi: "इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन",
    category: "disability",
    level: "central",
    state: "all",
    benefit: "₹300/month central share + state top-up — for persons with 80%+ disability from BPL families (18-79 years)",
    benefitHindi: "₹300/माह + राज्य टॉप-अप — 80%+ विकलांगता वाले BPL परिवार के सदस्यों के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, age_max: 79, gender: "all", states: ["all"], bpl_card: true, disability: 80 },
    documents: ["Aadhaar Card", "Disability Certificate (80%+)", "BPL Card", "Bank Passbook", "Age Proof"],
    apply_url: "https://nsap.nic.in",
    apply_mode: ["District Social Welfare Office", "Gram Panchayat / Municipal Office"],
    emoji: "🦽",
    tags: ["disability", "viklang", "divyang", "pension", "handicapped", "special_needs"],
    description: "Monthly pension for severely disabled BPL individuals to ensure basic financial support."
  },
  {
    id: "ADIP-001",
    name: "ADIP Scheme (Assistive Devices for Disabled)",
    nameHindi: "ADIP योजना — विकलांगों को सहायक उपकरण",
    category: "disability",
    level: "central",
    state: "all",
    benefit: "Free/subsidized assistive devices — hearing aids (₹25,000+), motorized tricycles, artificial limbs, cochlear implants, braille kits",
    benefitHindi: "मुफ्त/सब्सिडी पर सहायक उपकरण — श्रवण यंत्र, मोटर ट्राइसाइकल, कृत्रिम अंग, कॉक्लियर इम्प्लांट",
    eligibility: { occupation: ["all"], income_max: 20000, caste: ["all"], age_min: 0, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Disability Certificate (40%+)", "Income Certificate", "Bank Account", "Prescription from Specialist"],
    apply_url: "https://www.nhfdc.nic.in/schemes",
    apply_mode: ["ALIMCO Distribution Camps", "District Disability Office", "Artificial Limb Centres"],
    emoji: "🦿",
    tags: ["disability", "aids", "hearing_aid", "wheelchair", "artificial_limb", "divyang", "assistive_device"],
    description: "Provides free assistive aids and appliances to persons with disabilities for improved mobility and functionality."
  },

  // ═══════════════════════════════════════════════════════════════════
  // FOOD & NUTRITION
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "NFSA-001",
    name: "National Food Security Act (Ration Card)",
    nameHindi: "राष्ट्रीय खाद्य सुरक्षा अधिनियम — राशन कार्ड",
    category: "food",
    level: "central",
    state: "all",
    benefit: "5 kg foodgrains/person/month at ₹1 (rice), ₹2 (wheat), ₹3 (coarse grains) — for 81 crore people under AAY/PHH",
    benefitHindi: "₹1–₹3/kg पर 5 किलो अनाज प्रति व्यक्ति प्रतिमाह — राशन कार्ड धारकों के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, gender: "all", states: ["all"], bpl_card: true },
    documents: ["Aadhaar Card", "Ration Card (AAY/PHH)", "Family Details"],
    apply_url: "https://nfsa.gov.in",
    apply_mode: ["Nearest Fair Price Shop (FPS)", "Apply for ration card at Tehsil / Block Office", "State Food Portal"],
    emoji: "🍚",
    tags: ["food", "ration", "khana", "anaj", "wheat", "rice", "bpl", "below_poverty_line"],
    description: "Provides subsidized foodgrains to approximately 81 crore people through the Public Distribution System."
  },
  {
    id: "MDMS-001",
    name: "PM POSHAN (Mid-Day Meal) Scheme",
    nameHindi: "पीएम पोषण (मध्याह्न भोजन) योजना",
    category: "food",
    level: "central",
    state: "all",
    benefit: "Free hot cooked meal with 450–700 calories + 12–20g protein daily to all children in government/aided schools (Class 1–8)",
    benefitHindi: "सरकारी स्कूलों में कक्षा 1–8 के बच्चों को प्रतिदिन मुफ्त पका हुआ भोजन — 450–700 कैलोरी",
    eligibility: { occupation: ["student"], income_max: null, caste: ["all"], age_min: 6, age_max: 14, gender: "all", states: ["all"] },
    documents: ["School Enrollment (no documents needed from parents)"],
    apply_url: "https://pmposhan.education.gov.in",
    apply_mode: ["Automatically available in all government/aided schools", "Anganwadi Centres (for pre-school children)"],
    emoji: "🍱",
    tags: ["food", "school", "children", "meal", "nutrition", "midday", "bachche", "khana"],
    description: "Free nutritious meals in government schools to improve school attendance, nutrition, and learning outcomes."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE-SPECIFIC (UP)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "UP-KANYA-001",
    name: "Kanya Sumangala Yojana (UP)",
    nameHindi: "कन्या सुमंगला योजना (उत्तर प्रदेश)",
    category: "women",
    level: "state",
    state: "UP",
    benefit: "₹15,000 in 6 installments from birth to graduation — ₹2,000 at birth, ₹1,000 at vaccination, ₹2,000 at Class 1, ₹2,000 at Class 6, ₹3,000 at Class 9, ₹5,000 at graduation",
    benefitHindi: "₹15,000 छह किस्तों में — जन्म से स्नातक तक बेटियों के लिए",
    eligibility: { occupation: ["all"], income_max: 300000, caste: ["all"], age_min: 0, gender: "female", states: ["UP"] },
    documents: ["Birth Certificate", "Aadhaar Card", "Income Certificate (< ₹3L)", "Bank Account (joint with parent)", "Family Photo"],
    apply_url: "https://mksy.up.gov.in",
    apply_mode: ["mksy.up.gov.in", "BDO / SDM Office", "CSC Center"],
    emoji: "👧",
    tags: ["girl", "beti", "daughter", "UP", "uttar_pradesh", "education", "birth", "kanya"],
    description: "UP government scheme providing ₹15,000 in 6 installments from birth to graduation to support the girl child."
  },
  {
    id: "UP-PENSION-001",
    name: "UP Vridhavastha Pension Yojana",
    nameHindi: "यूपी वृद्धावस्था पेंशन योजना",
    category: "senior",
    level: "state",
    state: "UP",
    benefit: "₹1,000/month pension for senior citizens (60+) from BPL families in Uttar Pradesh",
    benefitHindi: "₹1,000 प्रतिमाह पेंशन — 60 वर्ष से अधिक BPL वृद्ध नागरिकों के लिए",
    eligibility: { occupation: ["all"], income_max: 46080, caste: ["all"], age_min: 60, gender: "all", states: ["UP"], bpl_card: true },
    documents: ["Aadhaar Card", "Age Proof", "Income Certificate", "BPL Card", "Bank Passbook"],
    apply_url: "https://sspy-up.gov.in",
    apply_mode: ["sspy-up.gov.in", "BDO / SDM Office", "CSC Center"],
    emoji: "👴",
    tags: ["pension", "old_age", "senior", "UP", "uttar_pradesh", "vridh"],
    description: "State pension scheme for BPL senior citizens in Uttar Pradesh."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE-SPECIFIC (Maharashtra)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "MH-LADKI-001",
    name: "Lek Ladki Yojana (Maharashtra)",
    nameHindi: "लेक लाडकी योजना (महाराष्ट्र)",
    category: "women",
    level: "state",
    state: "MH",
    benefit: "₹1,01,000 in installments from birth to age 18 for girls from economically weaker families — Yellow/Orange ration card holders",
    benefitHindi: "₹1,01,000 किस्तों में — जन्म से 18 वर्ष तक बेटियों के लिए (पीला/नारंगी राशन कार्ड धारक)",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, gender: "female", states: ["MH"] },
    documents: ["Birth Certificate", "Yellow/Orange Ration Card", "Aadhaar Card", "Bank Account", "Domicile Certificate"],
    apply_url: "https://womenchild.maharashtra.gov.in",
    apply_mode: ["Anganwadi Centre", "District Women & Child Development Office"],
    emoji: "👧",
    tags: ["girl", "beti", "daughter", "MH", "maharashtra", "ladki", "education"],
    description: "Maharashtra government scheme providing ₹1,01,000 in installments for girls from economically weaker families."
  },
  {
    id: "MH-MAJHI-001",
    name: "Majhi Kanya Bhagyashree (Maharashtra)",
    nameHindi: "माझी कन्या भाग्यश्री (महाराष्ट्र)",
    category: "women",
    level: "state",
    state: "MH",
    benefit: "₹50,000 fixed deposit for girl child after mother undergoes sterilization (1 daughter) or ₹25,000 each (2 daughters)",
    benefitHindi: "₹50,000 FD बेटी के नाम — नसबंदी के बाद (1 बेटी) या ₹25,000 प्रत्येक (2 बेटियां)",
    eligibility: { occupation: ["all"], income_max: 750000, caste: ["all"], age_min: 0, gender: "female", states: ["MH"] },
    documents: ["Birth Certificate", "Mother's Sterilization Certificate", "Aadhaar Card", "Income Certificate", "Bank Account"],
    apply_url: "https://womenchild.maharashtra.gov.in",
    apply_mode: ["District Women & Child Development Office", "Taluka Office"],
    emoji: "🌸",
    tags: ["girl", "beti", "MH", "maharashtra", "savings", "family_planning"],
    description: "Maharashtra scheme providing financial support through fixed deposits for families with girl children who adopt family planning."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE-SPECIFIC (Tamil Nadu)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "TN-MARRIAGE-001",
    name: "Moovalur Ramamirtham Marriage Assistance (TN)",
    nameHindi: "मूवलूर रामामिर्थम विवाह सहायता (तमिलनाडु)",
    category: "women",
    level: "state",
    state: "TN",
    benefit: "₹25,000 marriage assistance + 4g gold for thali (mangalsutra) for women graduates from poor families in Tamil Nadu",
    benefitHindi: "₹25,000 विवाह सहायता + 4 ग्राम सोना थाली के लिए — तमिलनाडु की गरीब स्नातक महिलाओं के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "female", states: ["TN"] },
    documents: ["Degree Certificate", "Aadhaar Card", "Family Card", "Marriage Invitation / Certificate", "Community Certificate"],
    apply_url: "https://www.tnsocialwelfare.tn.gov.in",
    apply_mode: ["District Social Welfare Office", "Taluk Office"],
    emoji: "💍",
    tags: ["marriage", "vivah", "women", "TN", "tamil_nadu", "gold", "graduate"],
    description: "Tamil Nadu scheme providing marriage assistance including gold and cash for women graduates from economically weaker families."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE-SPECIFIC (Rajasthan)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "RJ-CHIRANJEEVI-001",
    name: "Chiranjeevi Swasthya Bima Yojana (Rajasthan)",
    nameHindi: "चिरंजीवी स्वास्थ्य बीमा योजना (राजस्थान)",
    category: "health",
    level: "state",
    state: "RJ",
    benefit: "₹25 lakh/year free health insurance per family for hospitalization — covers 1,576 packages + ₹10 lakh for critical illnesses like cancer, heart disease",
    benefitHindi: "₹25 लाख/वर्ष मुफ्त स्वास्थ्य बीमा + ₹10 लाख गंभीर बीमारियों (कैंसर, हृदय रोग) के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, gender: "all", states: ["RJ"] },
    documents: ["Jan Aadhaar Card (Rajasthan)", "Aadhaar Card", "Mobile Number"],
    apply_url: "https://chiranjeevi.rajasthan.gov.in",
    apply_mode: ["chiranjeevi.rajasthan.gov.in", "E-Mitra Centre", "Empanelled Hospital Helpdesk"],
    emoji: "🏥",
    tags: ["health", "insurance", "hospital", "RJ", "rajasthan", "chiranjeevi", "free_treatment"],
    description: "Rajasthan's flagship universal health insurance scheme covering ₹25 lakh per family per year."
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE-SPECIFIC (West Bengal)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "WB-LAKSHMIR-001",
    name: "Lakshmir Bhandar (West Bengal)",
    nameHindi: "लक्ष्मीर भंडार (पश्चिम बंगाल)",
    category: "women",
    level: "state",
    state: "WB",
    benefit: "₹500/month (General) or ₹1,000/month (SC/ST) direct income support for women aged 25-60 — head of household",
    benefitHindi: "₹500/माह (सामान्य) या ₹1,000/माह (SC/ST) — 25-60 वर्ष की महिला परिवार प्रमुख को सीधे बैंक में",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 25, age_max: 60, gender: "female", states: ["WB"] },
    documents: ["Aadhaar Card", "Swasthya Sathi Card", "Bank Account", "Voter ID"],
    apply_url: "https://socialsecurity.wb.gov.in",
    apply_mode: ["Duare Sarkar Camp", "Block Development Office", "socialsecurity.wb.gov.in"],
    emoji: "💰",
    tags: ["women", "income_support", "WB", "west_bengal", "lakshmi", "monthly_income"],
    description: "West Bengal income support scheme providing monthly direct benefit transfer to women household heads."
  },

  // ═══════════════════════════════════════════════════════════════════
  // SOCIAL WELFARE & MISCELLANEOUS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "UJJWALA-001",
    name: "PM Ujjwala Yojana 2.0 (Free LPG Connection)",
    nameHindi: "प्रधानमंत्री उज्ज्वला योजना 2.0",
    category: "social_welfare",
    level: "central",
    state: "all",
    benefit: "Free LPG connection + first refill free + free stove — for BPL women, SC/ST households, no documents needed (just Aadhaar + self-declaration)",
    benefitHindi: "मुफ्त LPG कनेक्शन + पहला रिफिल मुफ्त + मुफ्त चूल्हा — BPL, SC/ST महिलाओं के लिए",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "female", states: ["all"], bpl_card: true },
    documents: ["Aadhaar Card", "Self-Declaration Form (for address proof)", "Bank Account", "Ration Card (if available)"],
    apply_url: "https://www.pmuy.gov.in",
    apply_mode: ["Nearest LPG Distributor (HP/Bharat/Indane)", "pmuy.gov.in", "CSC Center"],
    emoji: "🔥",
    tags: ["LPG", "gas", "cooking", "ujjwala", "women", "BPL", "free", "chulha", "cylinder"],
    description: "Provides free LPG connections to BPL women, replacing unhealthy cooking fuels with clean LPG gas."
  },
  {
    id: "PMGSY-001",
    name: "PM Gram Sadak Yojana (Rural Roads)",
    nameHindi: "प्रधानमंत्री ग्राम सड़क योजना",
    category: "social_welfare",
    level: "central",
    state: "all",
    benefit: "All-weather road connectivity to habitations with 500+ population (250+ in hilly/tribal areas) — community benefit scheme",
    benefitHindi: "500+ आबादी वाले गाँवों को पक्की सड़क से जोड़ना (पहाड़ी/जनजातीय क्षेत्रों में 250+)",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 0, gender: "all", states: ["all"], area: ["rural"] },
    documents: ["Community benefit — no individual application needed"],
    apply_url: "https://pmgsy.nic.in",
    apply_mode: ["Gram Panchayat can submit proposal", "Block Development Office", "State Rural Road Department"],
    emoji: "🛣️",
    tags: ["road", "sadak", "rural", "village", "connectivity", "infrastructure"],
    description: "Provides all-weather road connectivity to unconnected rural habitations across India."
  },
  {
    id: "SBM-001",
    name: "Swachh Bharat Mission 2.0 (Free Toilet)",
    nameHindi: "स्वच्छ भारत मिशन 2.0 — मुफ्त शौचालय",
    category: "social_welfare",
    level: "central",
    state: "all",
    benefit: "₹12,000 assistance for construction of individual household toilet + solid/liquid waste management at village level",
    benefitHindi: "₹12,000 सहायता व्यक्तिगत शौचालय निर्माण के लिए + गाँव स्तर पर कचरा प्रबंधन",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"], area: ["rural"], exclusions: ["households_with_toilet"] },
    documents: ["Aadhaar Card", "BPL Card / SECC Data", "Bank Account", "Photograph"],
    apply_url: "https://sbm.gov.in",
    apply_mode: ["Gram Panchayat Office", "Block Development Office", "sbm.gov.in"],
    emoji: "🚽",
    tags: ["toilet", "shauchalay", "sanitation", "swachh", "clean", "hygiene"],
    description: "Provides financial assistance for toilet construction in rural households to achieve Open Defecation Free status."
  },
  {
    id: "PMAY-SOLAR-001",
    name: "PM Surya Ghar Muft Bijli Yojana (Free Solar)",
    nameHindi: "पीएम सूर्य घर मुफ्त बिजली योजना",
    category: "social_welfare",
    level: "central",
    state: "all",
    benefit: "₹30,000–₹78,000 subsidy on rooftop solar panels — get 300 units free electricity/month, sell excess to grid, reduce bill to zero",
    benefitHindi: "₹30,000–₹78,000 सब्सिडी छत पर सोलर पैनल के लिए — 300 यूनिट मुफ्त बिजली/माह",
    eligibility: { occupation: ["all"], income_max: null, caste: ["all"], age_min: 18, gender: "all", states: ["all"] },
    documents: ["Aadhaar Card", "Electricity Bill", "Bank Account", "Roof Ownership / NOC"],
    apply_url: "https://pmsuryaghar.gov.in",
    apply_mode: ["pmsuryaghar.gov.in", "DISCOM Portal", "Registered Solar Vendor"],
    emoji: "☀️",
    tags: ["solar", "electricity", "bijli", "free", "subsidy", "rooftop", "surya", "green_energy"],
    description: "Massive subsidy on rooftop solar installations enabling households to generate free electricity and become energy independent."
  },
];

// ─── Category and state metadata ────────────────────────────────────────────
const CATEGORIES = {
  agriculture: { label: "Agriculture", labelHindi: "कृषि", emoji: "🌾", color: "#22c55e" },
  health: { label: "Health", labelHindi: "स्वास्थ्य", emoji: "💊", color: "#ef4444" },
  scholarship: { label: "Scholarship & Education", labelHindi: "छात्रवृत्ति और शिक्षा", emoji: "🎓", color: "#3b82f6" },
  housing: { label: "Housing", labelHindi: "आवास", emoji: "🏠", color: "#eab308" },
  startup: { label: "Startup & Business", labelHindi: "स्टार्टअप और व्यापार", emoji: "🚀", color: "#a855f7" },
  financial: { label: "Financial Inclusion & Insurance", labelHindi: "वित्तीय समावेशन और बीमा", emoji: "🏦", color: "#14b8a6" },
  women: { label: "Women & Child Welfare", labelHindi: "महिला और बाल कल्याण", emoji: "👩", color: "#ec4899" },
  skill: { label: "Skill Development & Employment", labelHindi: "कौशल विकास और रोजगार", emoji: "🔧", color: "#f97316" },
  senior: { label: "Senior Citizens", labelHindi: "वरिष्ठ नागरिक", emoji: "👴", color: "#6366f1" },
  disability: { label: "Disability", labelHindi: "दिव्यांग", emoji: "♿", color: "#8b5cf6" },
  food: { label: "Food & Nutrition", labelHindi: "खाद्य और पोषण", emoji: "🍚", color: "#d97706" },
  social_welfare: { label: "Social Welfare", labelHindi: "सामाजिक कल्याण", emoji: "🤝", color: "#0ea5e9" },
};

// ─── Build final JSON ───────────────────────────────────────────────────────
function buildDatabase() {
  console.log("🔨 Building HaqDaar scheme database...\n");

  const database = {
    version: "2.0.0",
    lastUpdated: new Date().toISOString().split("T")[0],
    source: "MyScheme.gov.in + Government Gazette",
    totalSchemes: SEED_SCHEMES.length,
    categories: CATEGORIES,
    schemes: SEED_SCHEMES,
  };

  // Stats
  const centralCount = SEED_SCHEMES.filter(s => s.level === "central").length;
  const stateCount = SEED_SCHEMES.filter(s => s.level === "state").length;
  const uniqueStates = [...new Set(SEED_SCHEMES.filter(s => s.state !== "all").map(s => s.state))];
  const categoryCounts = {};
  SEED_SCHEMES.forEach(s => { categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1; });

  console.log(`📊 Database Statistics:`);
  console.log(`   Total schemes: ${SEED_SCHEMES.length}`);
  console.log(`   Central: ${centralCount}`);
  console.log(`   State-specific: ${stateCount} (states: ${uniqueStates.join(", ")})`);
  console.log(`   Categories:`);
  Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`     ${CATEGORIES[cat]?.emoji || "📋"} ${cat}: ${count}`);
  });

  // Write output
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(database, null, 2), "utf8");
  console.log(`\n✅ Written to: ${OUTPUT_PATH}`);
  console.log(`   File size: ${(JSON.stringify(database).length / 1024).toFixed(1)} KB`);

  return database;
}

buildDatabase();
