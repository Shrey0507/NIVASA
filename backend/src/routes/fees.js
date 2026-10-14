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
      .from("fees")
      .select("*, students(full_name, usn, hostel)")
      .order("due_date", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (student_id) query = query.eq("student_id", student_id);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:id/pay", async (req, res) => {
  try {
    const { payment_method, transaction_id } = req.body;
    const { data, error } = await supabaseAdmin
      .from("fees")
      .update({
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
        payment_method: payment_method || "Online",
        transaction_id: transaction_id || `TXN-${Date.now()}`,
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
