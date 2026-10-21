import Link from "next/link";
import { Shield, Sparkles, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-gray-950/80 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center text-sm">
                🇮🇳
              </span>
              <span className="text-lg font-black tracking-tight text-white">
                <span className="text-orange-400">Haq</span>Daar
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empowering 1.4 billion Indian citizens with instant, AI-driven discovery of government welfare schemes and entitlement programs in their mother tongue.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Free & Citizen-First • Zero Ads • No Bureaucracy</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/schemes" className="hover:text-white transition-colors">
                  All Central & State Schemes (155)
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors text-orange-400/90 font-medium">
                  ⚖️ Compare Schemes Side-by-Side
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors text-emerald-400/90 font-medium">
                  📁 My Welfare Vault & Tracker
                </Link>
              </li>
              <li>
                <Link href="/csc-locator" className="hover:text-white transition-colors">
                  📍 CSC / Jan Seva Kendra Locator
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-white transition-colors">
                  📊 National Impact & Benefit Calculator
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-white transition-colors">
                  💬 Conversational Eligibility Check
                </Link>
              </li>
              <li>
                <Link href="/voice" className="hover:text-white transition-colors flex items-center gap-1.5">
                  🎙️ Gemini Live Voice Assistant
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 font-semibold">
                    Live
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Domains */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
              Key Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/schemes?category=agriculture" className="hover:text-white transition-colors">
                  🌾 Farmer & Agriculture Support
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=health" className="hover:text-white transition-colors">
                  💊 Healthcare & Ayushman Bharat
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=scholarship" className="hover:text-white transition-colors">
                  🎓 Scholarships & Education
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=women" className="hover:text-white transition-colors">
                  👩 Women & Child Welfare
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=startup" className="hover:text-white transition-colors">
                  🚀 MSME, Mudra & Startup Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Verification */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
              Official Portals
            </h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Verify applications and track status directly on authorized government websites.
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  myScheme.gov.in
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  PM-KISAN Samman Nidhi
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Ayushman Bharat PM-JAY
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 HaqDaar. Built for the citizens of Bharat.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Powered by Gemini 2.5 Flash</span>
            <Sparkles className="w-3 h-3 text-amber-400 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
