import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Supabase not configured" });
  }

  try {
    const { status, student_id } = req.query;
    let query = supabaseAdmin
      .from("movements")
      .select("*, students(full_name, usn, hostel, room_id, rooms(room_number))")
      .order("check_out_time", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (student_id) query = query.eq("student_id", student_id);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, purpose, destination, expected_return_time, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from("movements")
      .insert([
        {
          student_id,
          purpose,
          destination,
          expected_return_time,
          status: status || "out",
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

router.post("/:id/return", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("movements")
      .update({
        status: "returned",
        actual_return_time: new Date().toISOString(),
      })
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
