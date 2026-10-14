import "dotenv/config";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const expected = ["user_profiles", "students", "hostels", "blocks", "rooms", "room_allocations", "fee_records", "movements", "grievances", "notices", "mess_menus"];
if (!isSupabaseConfigured() || !supabaseAdmin) { console.error(JSON.stringify({ status: "not_configured", expected })); process.exitCode = 2; }
else {
  const result = {};
  for (const table of expected) { const { error } = await supabaseAdmin.from(table).select("*", { count: "exact", head: true }); result[table] = error ? { accessible: false, error: error.message } : { accessible: true }; }
  console.log(JSON.stringify({ status: "checked", tables: result }, null, 2));
}
