import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Supabase not configured" });
  }

  try {
    const { target_audience } = req.query;
    let query = supabaseAdmin
      .from("notices")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (target_audience && target_audience !== "all") {
      query = query.or(`target_audience.eq.all,target_audience.eq.${target_audience}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content, target_audience, priority, published_by, is_pinned } = req.body;
    const { data, error } = await supabaseAdmin
      .from("notices")
      .insert([
        {
          title,
          content,
          target_audience: target_audience || "all",
          priority: priority || "normal",
          published_by: published_by || "Hostel Warden",
          is_pinned: Boolean(is_pinned),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
