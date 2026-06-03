import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("reviews")
      .update({ 
        resolved: true, 
        resolved_at: new Date().toISOString() 
      })
      .eq("id", reviewId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
