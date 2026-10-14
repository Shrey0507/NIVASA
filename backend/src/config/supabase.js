import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => Boolean(
  url && anonKey && serviceRoleKey && url.startsWith("https://") &&
  !url.includes("your-project-ref") && !anonKey.includes("your-supabase") &&
  !serviceRoleKey.includes("your-supabase")
);

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
export const supabase = isSupabaseConfigured() ? createClient(url, anonKey, options) : null;
export const supabaseAdmin = isSupabaseConfigured() ? createClient(url, serviceRoleKey, options) : null;
export const getSupabaseForToken = (token) => isSupabaseConfigured()
  ? createClient(url, anonKey, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } })
  : null;
