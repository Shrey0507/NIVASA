import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const tables = ["user_profiles", "students", "hostels", "blocks", "rooms", "room_allocations", "fee_records", "movements", "grievances", "notices", "mess_menus"];
console.log("NIVASA Supabase compatibility check\n");
if (!isSupabaseConfigured() || !supabaseAdmin) { console.log("Supabase is not configured."); process.exitCode = 2; }
else {
  for (const table of tables) {
    try { const { error } = await supabaseAdmin.from(table).select("id", { count: "exact", head: true }); console.log(error ? `WARN ${table}: ${error.message}` : `OK   ${table}`); }
    catch (error) { console.log(`FAIL ${table}: ${error.message}`); }
  }
}
