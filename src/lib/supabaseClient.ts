/**
 * Unified Supabase client entrypoints.
 * - Client Components: import { supabaseBrowser } from "@/lib/supabaseClient"
 */

import { createClient as createBrowserClient } from "@/lib/supabase/client";

export function supabaseBrowser() {
  return createBrowserClient();
}

