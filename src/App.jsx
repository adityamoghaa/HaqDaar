import { useState, useRef, useEffect } from "react";
import { schemes, matchSchemes } from "./data/schemes.js";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// System prompt for conversational profile extraction
const SYSTEM_PROMPT = `You are HaqDaar's AI assistant — a friendly, empathetic guide helping Indian citizens discover government schemes they qualify for.

Your job:
1. Have a warm, conversational chat in WHATEVER LANGUAGE the user writes in (Hindi, English, Hinglish, Tamil, etc.)
2. Silently extract a profile JSON from the conversation
3. Ask at most 2-3 follow-up questions to fill missing critical fields (state, income range, occupation, age, caste category)
4. ALWAYS be simple, warm, respectful — never bureaucratic

After each user message, respond with a JSON object like this (always valid JSON, no markdown):
{
  "message": "Your friendly conversational response to the user (in their language)",
  "profile": {
    "state": null or "UP" or state name,
    "age": null or number,
    "gender": null or "male" or "female",
    "occupation": null or "farmer" or "student" or "daily_wage" or "self_employed" or "unemployed" or "retired",
    "income": null or annual income in rupees (estimate from description),
    "caste": null or "SC" or "ST" or "OBC" or "general",
    "bpl": null or true or false,
    "widow": null or true or false,
    "raw_text": "cumulative summary of all facts user has shared"
  },
  "ready_to_match": true or false (true when you have enough info to find schemes — at least occupation + state OR income),
  "follow_up": null or "the next question to ask if more info needed"
}

Key rules:
- If user writes in Hindi, respond in Hindi
- If Hinglish, respond in Hinglish  
- Be warm and say things like "मुझे आपकी मदद करने में खुशी होगी"
- When ready_to_match is true, say you're finding their schemes now
- Never ask more than 3 questions total across the conversation
- Income: if they say "80 hazaar" that's ₹80,000. "2 lakh" = ₹200,000
- Occupation hints: "kisan/farmer/kheti" = farmer, "padh raha/student/college" = student, "majduri/daily wage/construction" = daily_wage`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState({});
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [phase, setPhase] = useState("landing"); // landing | chat | results
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("hi");
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Web Speech API setup
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = language === "hi" ? "hi-IN" : "en-IN";
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  };

  const startChat = (lang) => {
    setLanguage(lang);
    setPhase("chat");
    const greeting =
      lang === "hi"
        ? "नमस्ते! मैं HaqDaar हूँ 🙏\n\nआप अपनी स्थिति बताइए — जैसे कहाँ रहते हैं, क्या काम करते हैं, परिवार कैसा है। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।"
        : "Hello! I'm HaqDaar 🙏\n\nTell me about yourself — where you live, what you do, your family situation. I'll find government schemes you qualify for.";
    setMessages([{ role: "assistant", content: greeting }]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const newHistory = [...conversationHistory, { role: "user", content: text }];

    try {
      // Proxy avoids CORS. Falls back to direct call if API key set in env.
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const endpoint = apiKey
        ? "https://api.anthropic.com/v1/messages"
        : "http://localhost:3001/api/chat";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "x-api-key": apiKey }),
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });

      const data = await response.json();
      const rawText = data.content?.[0]?.text || "{}";

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { message: rawText, profile: {}, ready_to_match: false };
      }

      const assistantMsg = { role: "assistant", content: parsed.message };
      setMessages([...newMessages, assistantMsg]);
      setConversationHistory([...newHistory, { role: "assistant", content: rawText }]);

      // Merge profile
      const updatedProfile = { ...profile };
      if (parsed.profile) {
        Object.entries(parsed.profile).forEach(([k, v]) => {
          if (v !== null && v !== undefined) updatedProfile[k] = v;
        });
      }
      setProfile(updatedProfile);

      // Auto-match if ready
      if (parsed.ready_to_match) {
        setTimeout(() => {
          const matched = matchSchemes(updatedProfile);
          setMatchedSchemes(matched);
          setPhase("results");
          speak(parsed.message);
        }, 800);
      } else {
        speak(parsed.message);
      }
    } catch (err) {
      const errMsg =
        language === "hi"
          ? "माफ़ करें, कुछ गड़बड़ हुई। फिर से कोशिश करें।"
          : "Sorry, something went wrong. Please try again.";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
    }
    setLoading(false);
  };

  const resetApp = () => {
    setMessages([]);
    setInput("");
    setProfile({});
    setMatchedSchemes([]);
    setSelectedScheme(null);
    setConversationHistory([]);
    setPhase("landing");
  };

  const categoryColors = {
    agriculture: "bg-green-900 text-green-300 border-green-700",
    health: "bg-red-900 text-red-300 border-red-700",
    scholarship: "bg-blue-900 text-blue-300 border-blue-700",
    housing: "bg-yellow-900 text-yellow-300 border-yellow-700",
    startup: "bg-purple-900 text-purple-300 border-purple-700",
    financial: "bg-teal-900 text-teal-300 border-teal-700",
    women: "bg-pink-900 text-pink-300 border-pink-700",
    skill: "bg-orange-900 text-orange-300 border-orange-700",
    senior: "bg-indigo-900 text-indigo-300 border-indigo-700",
  };

  // LANDING
  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="text-5xl font-black tracking-tight mb-2">
              <span className="text-orange-500">Haq</span>
              <span className="text-white">Daar</span>
            </div>
            <div className="text-gray-400 text-lg font-light italic">हक़दार</div>
            <div className="mt-4 text-gray-400 text-sm leading-relaxed">
              Discover every government scheme you qualify for — in your language, in your voice.
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[["1,000+", "Schemes"], ["10+", "Languages"], ["₹0", "Cost"]].map(([n, l]) => (
              <div key={l} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-orange-500 font-black text-lg">{n}</div>
                <div className="text-gray-500 text-xs">{l}</div>
              </div>
            ))}
          </div>

          {/* Language selection */}
          <div className="mb-4 text-center text-gray-500 text-sm">Choose your language / भाषा चुनें</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => startChat("hi")}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all text-base"
            >
              🎙️ हिंदी में बोलें
            </button>
            <button
              onClick={() => startChat("en")}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl border border-gray-700 transition-all text-base"
            >
              🎙️ Speak English
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["ta", "தமிழ்"], ["te", "తెలుగు"], ["bn", "বাংলা"]].map(([code, label]) => (
              <button
                key={code}
                onClick={() => startChat(code)}
                className="bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium py-3 rounded-xl border border-gray-800 transition-all"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sample personas */}
          <div className="mt-8">
            <div className="text-gray-600 text-xs text-center mb-3">Try saying...</div>
            <div className="space-y-2">
              {[
                "Main UP ka kisan hoon, 3 bacche hain, income 80,000 saal ki hai",
                "I'm a college student in Maharashtra, SC category, family income 1.5 lakh",
                "मैं दिल्ली में काम करती हूँ, घर नहीं है, 35 साल की हूँ",
              ].map((s) => (
                <div
                  key={s}
                  onClick={() => { startChat("hi"); setTimeout(() => setInput(s), 100); }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 cursor-pointer hover:border-orange-600 hover:text-gray-200 transition-all"
                >
                  💬 "{s}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === "results") {
    if (selectedScheme) {
      const s = selectedScheme;
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center gap-3">
            <button onClick={() => setSelectedScheme(null)} className="text-orange-500 text-2xl">←</button>
            <div>
              <div className="text-white font-bold text-sm">{s.name}</div>
              <div className="text-gray-400 text-xs">{s.nameHindi}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
            <div className="text-4xl text-center py-4">{s.emoji}</div>

            <div className="bg-green-900 border border-green-700 rounded-xl p-4">
              <div className="text-green-300 font-bold text-xs mb-1">✅ WHAT YOU GET</div>
              <div className="text-white text-sm font-medium">{s.benefit}</div>
              <div className="text-green-400 text-xs mt-1">{s.benefitHindi}</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-orange-400 font-bold text-xs mb-2">📋 DOCUMENTS NEEDED</div>
              <div className="space-y-1">
                {s.documents.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-500">✓</span> {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-orange-400 font-bold text-xs mb-2">🗺️ HOW TO APPLY</div>
              <div className="space-y-1">
                {s.apply_mode.map((m) => (
                  <div key={m} className="text-sm text-gray-300">• {m}</div>
                ))}
              </div>
            </div>

            <a
              href={s.apply_url}
              target="_blank"
              rel="noreferrer"
              className="block bg-orange-600 hover:bg-orange-500 text-white font-bold text-center py-4 rounded-xl transition-all"
            >
              🌐 Apply Online →
            </a>

            <button
              onClick={() => speak(`${s.name}. ${s.benefit}. Documents needed: ${s.documents.join(", ")}`)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl border border-gray-700 transition-all text-sm"
            >
              🔊 सुनें / Listen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <div className="text-white font-black text-lg">
                <span className="text-orange-500">Haq</span>Daar
              </div>
              <div className="text-green-400 text-xs font-medium">
                {matchedSchemes.length} schemes found for you ✓
              </div>
            </div>
            <button onClick={resetApp} className="text-gray-500 text-xs border border-gray-800 px-3 py-1 rounded-lg hover:border-gray-600">
              New Search
            </button>
          </div>
        </div>

        {/* Profile summary */}
        <div className="bg-gray-900 border-b border-gray-800 p-3">
          <div className="max-w-lg mx-auto flex flex-wrap gap-2">
            {[
              profile.state && `📍 ${profile.state}`,
              profile.occupation && `💼 ${profile.occupation}`,
              profile.caste && `🏷️ ${profile.caste}`,
              profile.income && `💰 ₹${(profile.income / 1000).toFixed(0)}k/yr`,
              profile.age && `👤 ${profile.age} yrs`,
            ]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
          {matchedSchemes.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <div className="text-4xl mb-4">🔍</div>
              <div>No matching schemes found. Try adding more details about yourself.</div>
              <button onClick={() => setPhase("chat")} className="mt-4 text-orange-500">
                ← Go back and add more info
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedSchemes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScheme(s)}
                  className="w-full bg-gray-900 border border-gray-800 hover:border-orange-600 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{s.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-white font-semibold text-sm leading-tight">{s.name}</div>
                        <div className="bg-green-900 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-green-800">
                          {s.score}% match
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{s.nameHindi}</div>
                      <div className="text-orange-400 text-xs mt-2 font-medium">{s.benefit.split(" — ")[0]}</div>
                      <div className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border ${categoryColors[s.category] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                        {s.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setPhase("chat")}
                className="w-full bg-gray-900 border border-dashed border-gray-700 hover:border-orange-600 rounded-xl p-4 text-center text-gray-500 text-sm transition-all mt-2"
              >
                + Add more details to find more schemes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CHAT
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="text-white font-black text-lg">
          <span className="text-orange-500">Haq</span>Daar
        </div>
        <button onClick={resetApp} className="text-gray-500 text-xs border border-gray-800 px-3 py-1 rounded-lg">
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-lg mx-auto w-full">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-orange-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={startListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all ${
              listening ? "bg-red-600 animate-pulse" : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            🎙️
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={language === "hi" ? "अपनी बात लिखें..." : "Type your message..."}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-600"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0 transition-all"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
