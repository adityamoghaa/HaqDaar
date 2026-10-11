// GET /api/schemes — Search and list government schemes
import { NextRequest, NextResponse } from "next/server";
import { searchSchemes, filterSchemes, categories } from "@/lib/schemeSearch";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const state = searchParams.get("state") || "all";
  const level = searchParams.get("level") || "all";

  let results = searchSchemes(q);

  if (category !== "all" || state !== "all" || level !== "all") {
    results = results.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (state !== "all" && s.state !== "all" && s.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }
      if (level !== "all" && s.level !== level) return false;
      return true;
    });
  }

  return NextResponse.json({
    total: results.length,
    categories,
    schemes: results,
  });
}
