/**
 * Example test query — verifies Supabase connectivity from the server.
 * GET /api/health/supabase
 * Returns { ok: true, timestamp } or error details (no secrets).
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Minimal call: auth health + optional DB ping if you have a public table.
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { ok: false, step: "auth_session", message: sessionError.message },
        { status: 500 }
      );
    }

    // Optional: uncomment when you have a table, e.g. study_stats
    // const { error: tableError } = await supabase.from("study_stats").select("user_id").limit(1);
    // if (tableError && tableError.code !== "PGRST116") { ... }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      hasSession: !!sessionData?.session,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
