import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

/**
 * GET /api/audit/autocomplete?input=Sunny+Dental
 * Public endpoint — no auth required. Proxies Google Places Autocomplete.
 * Returns up to 5 dental clinic predictions.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("input");

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 }
      );
    }

    // Use Query Autocomplete — broader than Place Autocomplete for business names
    const url = `${PLACES_BASE}/queryautocomplete/json?input=${encodeURIComponent(input + " dental")}&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places autocomplete error:", data.status, data.error_message);
      return NextResponse.json(
        { error: "Places API error" },
        { status: 500 }
      );
    }

    const predictions = (data.predictions || []).slice(0, 5).map((p: any) => ({
      place_id: p.place_id,
      name: p.structured_formatting?.main_text || p.description?.split(",")[0] || p.description || "",
      address: p.structured_formatting?.secondary_text || p.description || "",
      full: p.description || "",
    }));

    return NextResponse.json({ predictions });
  } catch (err: any) {
    console.error("Autocomplete error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
