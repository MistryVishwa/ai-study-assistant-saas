/**
 * Barrel re-exports. Client components should import from @/lib/supabase/client.
 * Server code should import from @/lib/supabase/server.
 */

export { createClient } from "./supabase/client";
export { createServerSupabaseClient } from "./supabase/server";
