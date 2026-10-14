import { Router } from "express";
import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  const configured = isSupabaseConfigured();
  let dbStatus = "unconfigured";
  let dbError = null;

  if (configured) {
    try {
      const { error } = await supabase.from("students").select("id").limit(1);
      if (error) {
        dbStatus = "error";
        dbError = error.message;
      } else {
        dbStatus = "connected";
      }
    } catch (err) {
      dbStatus = "error";
      dbError = err.message;
    }
  }

  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "NIVASA Backend API",
    supabase: {
      configured,
      status: dbStatus,
      error: dbError,
    },
  });
});

export default router;
