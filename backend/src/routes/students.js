import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured yet. Please check backend/.env.",
    });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const hostel = req.query.hostel || "";
    const status = req.query.status || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("students")
      .select("*, rooms(block, floor, room_number)", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (hostel && hostel !== "all") {
      query = query.eq("hostel", hostel);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,usn.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*, rooms(*)")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { usn, full_name, email, phone, department, year, hostel, room_id, emergency_contact } = req.body;
    if (!usn || !full_name || !email || !hostel) {
      return res.status(400).json({ error: "USN, full_name, email, and hostel are required." });
    }

    const { data, error } = await supabaseAdmin
      .from("students")
      .insert([{ usn, full_name, email, phone, department, year, hostel, room_id, emergency_contact }])
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
    const { data, error } = await supabaseAdmin
      .from("students")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("students").delete().eq("id", req.params.id);
    if (error) throw error;
    return res.json({ message: "Student deleted successfully" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
