// GET /api/health — Enterprise health & readiness check
import { NextResponse } from "next/server";
import { GEMINI_MODEL } from "@/lib/gemini";
import schemesData from "@/data/schemes.json";

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "HaqDaar Enterprise Next.js API",
    version: "4.0.0",
    model: GEMINI_MODEL,
    totalSchemes: schemesData.schemes.length,
    geminiConfigured: hasKey,
    uptime: process.uptime(),
  });
}
