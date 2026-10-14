import { supabase, isSupabaseConfigured } from "../config/supabase.js";

async function testConnection() {
  console.log("==========================================");
  console.log("   NIVASA - Supabase Connection Tester    ");
  console.log("==========================================\n");

  if (!isSupabaseConfigured()) {
    console.warn("⚠️  Supabase is not configured yet with valid credentials.");
    console.log("👉 Please update SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env\n");
    return;
  }

  console.log("⏳ Testing connection to Supabase...");
  const tables = ["students", "rooms", "fees", "movements", "grievances", "notices", "mess_menu"];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("count", { count: "exact", head: true });
      if (error) {
        console.log(`⚠️  Table "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": Accessible.`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}": ${err.message}`);
    }
  }

  console.log("\n✨ Connection test finished.");
}

testConnection();
