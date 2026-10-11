// POST /api/explain — Scheme explanation in plain language via Gemini
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { explainRequestSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`explain:${ip}`, { maxRequests: 20, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many explanation requests. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = explainRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { profile, scheme, language } = parsed.data;
    const isHindi = language === "hi";
    const lang = isHindi ? "Hindi (हिन्दी)" : "English";

    const systemPrompt = `You are HaqDaar, an empathetic citizen advocate explaining an Indian government welfare scheme in simple, everyday ${lang}.

Structure your response into 4 crisp, actionable bullet points:
1. **Why You Qualify**: Point directly to their situation (e.g. state, occupation, income)
2. **Benefit Breakdown**: What exact financial or physical help they receive
3. **Application Steps**: Simple 1-2-3 path (online portal or CSC / block office)
4. **Documents to Keep Ready**: Crucial checklist items (Aadhaar, Bank Passbook, etc.)

Tone: Warm, dignified, encouraging, zero bureaucratic jargon.
Return strict JSON:
{
  "explanation": "Markdown formatted explanation string with bold headings and bullet points"
}`;

    const userMessage = {
      role: "user",
      content: `User Profile:
${JSON.stringify(profile, null, 2)}

Scheme Details:
${JSON.stringify(scheme, null, 2)}`,
    };

    try {
      const aiResult = await callGemini(systemPrompt, [userMessage], 1800);
      const rawText = aiResult.content?.[0]?.text || "{}";
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsedAi = JSON.parse(cleaned);

      return NextResponse.json({
        explanation: parsedAi.explanation || rawText,
      });
    } catch (aiErr) {
      console.warn("[Explain API] Gemini error, providing fallback explanation:", (aiErr as Error).message);
      const fallback = isHindi
        ? `### ${scheme.nameHindi || scheme.name}
- **पात्रता**: आपकी प्रोफ़ाइल (${profile.occupation || "नागरिक"}, ${profile.state || "भारत"}) इस योजना के मानदंडों से मेल खाती है।
- **लाभ**: ${scheme.benefitHindi || scheme.benefit || "वित्तीय और सामाजिक सहायता"}
- **आवेदन कैसे करें**: निकटतम जन सेवा केंद्र (CSC) जाएं या आधिकारिक पोर्टल पर ऑनलाइन आवेदन करें।
- **आवश्यक दस्तावेज**: आधार कार्ड, बैंक खाता पासबुक, निवास प्रमाण पत्र, आय प्रमाण पत्र।`
        : `### ${scheme.name}
- **Eligibility**: Your background (${profile.occupation || "Citizen"}, ${profile.state || "India"}) matches this scheme's criteria.
- **Benefit**: ${scheme.benefit || "Direct financial & social assistance"}
- **How to Apply**: Visit your nearest Common Service Centre (CSC) or submit online at the official portal.
- **Required Documents**: Aadhaar Card, Bank Passbook, Domicile/Residence proof, Income certificate.`;

      return NextResponse.json({ explanation: fallback });
    }
  } catch (err) {
    console.error("[API /explain] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
