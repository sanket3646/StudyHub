import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { userId, noteId, paymentId } = await req.json();

    if (!userId || !noteId || !paymentId) {
      return NextResponse.json(
        { error: "userId, noteId, and paymentId required" },
        { status: 400 }
      );
    }

    // Only check for error; data is not needed
    const { error } = await supabase
      .from("purchases")
      .insert([{ user_id: userId, note_id: noteId, payment_id: paymentId }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
