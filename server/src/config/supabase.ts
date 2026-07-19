// ──────────────────────────────────────────────
// XOChat — Supabase client initialization
// ──────────────────────────────────────────────
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}
