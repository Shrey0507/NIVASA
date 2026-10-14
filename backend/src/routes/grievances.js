import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Supabase not configured" });
  }

  try {
    const { status, priority, category } = req.query;
    let query = supabaseAdmin
      .from("grievances")
      .select("*, students(full_name, usn, hostel, rooms(room_number))")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (priority && priority !== "all") query = query.eq("priority", priority);
    if (category && category !== "all") query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, title, description, category, priority } = req.body;
    const { data, error } = await supabaseAdmin
      .from("grievances")
      .insert([{ student_id, title, description, category, priority: priority || "medium" }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, assigned_to, resolution_notes } = req.body;
    const updatePayload = { status, assigned_to, resolution_notes };
    if (status === "resolved") {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("grievances")
      .update(updatePayload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
