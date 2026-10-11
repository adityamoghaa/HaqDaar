// POST /api/match — RAG Scheme Matching via Gemini with rule-based fallback
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { matchRequestSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { matchSchemesRuleBased, schemes } from "@/lib/schemeSearch";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`match:${ip}`, { maxRequests: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = matchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { profile, candidates } = parsed.data;

    const candidateList = (candidates && candidates.length > 0)
      ? candidates
      : schemes.slice(0, 30);

    const systemPrompt = `You are an expert Indian government scheme eligibility evaluator.
Given a citizen's profile and a list of candidate schemes, calculate relevance and score each scheme.

Return a valid JSON array of objects:
[
  {
    "id": "scheme_id",
    "score": 85, // 0-99 relevance score
    "reason": "Clear 1-sentence explanation of why they qualify",
    "relevant": true
  }
]

Include only schemes with score >= 35. Sort by score descending. Return at most 15 schemes.
User Profile:
${JSON.stringify(profile, null, 2)}`;

    const userMessage = {
      role: "user",
      content: `Candidate schemes:\n${JSON.stringify(
        candidateList.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          state: c.state,
          level: c.level,
          benefit: c.benefit,
          eligibility: c.eligibility,
          tags: c.tags,
        })),
        null,
        2
      )}`,
    };

    try {
      const aiResult = await callGemini(systemPrompt, [userMessage], 3000);
      const rawText = aiResult.content?.[0]?.text || "[]";
      // Sanitize JSON markdown wrapping if model returns ```json
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const rankedMatches = JSON.parse(cleaned);

      return NextResponse.json({
        success: true,
        source: "gemini",
        matches: rankedMatches,
      });
    } catch (aiErr) {
      console.warn("[Match API] Gemini error, falling back to rule-based matcher:", (aiErr as Error).message);
      const fallbackMatches = matchSchemesRuleBased(profile);
      return NextResponse.json({
        success: true,
        source: "rule-based",
        matches: fallbackMatches.map((m) => ({
          id: m.id,
          score: m.score,
          reason: m.reasons.join(". ") || "Matches your demographic profile",
          relevant: true,
        })),
      });
    }
  } catch (err) {
    console.error("[API /match] Uncaught error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
