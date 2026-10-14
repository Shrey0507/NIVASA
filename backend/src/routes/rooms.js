import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: "Supabase not configured" });
  }

  try {
    const { hostel, block, floor, status } = req.query;
    let query = supabaseAdmin.from("rooms").select("*").order("room_number");

    if (hostel && hostel !== "all") query = query.eq("hostel", hostel);
    if (block && block !== "all") query = query.eq("block", block);
    if (floor) query = query.eq("floor", parseInt(floor));
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { hostel, block, floor, room_number, capacity, type } = req.body;
    const { data, error } = await supabaseAdmin
      .from("rooms")
      .insert([{ hostel, block, floor, room_number, capacity: capacity || 2, type: type || "standard" }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/:id/allocate", async (req, res) => {
  try {
    const { student_id } = req.body;
    const roomId = req.params.id;

    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) return res.status(404).json({ error: "Room not found" });
    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ error: "Room is already at full capacity" });
    }

    const { error: studentUpdateError } = await supabaseAdmin
      .from("students")
      .update({ room_id: roomId })
      .eq("id", student_id);

    if (studentUpdateError) throw studentUpdateError;

    const newOccupancy = room.current_occupancy + 1;
    const newStatus = newOccupancy >= room.capacity ? "full" : "available";

    const { data: updatedRoom, error: occupancyError } = await supabaseAdmin
      .from("rooms")
      .update({ current_occupancy: newOccupancy, status: newStatus })
      .eq("id", roomId)
      .select()
      .single();

    if (occupancyError) throw occupancyError;

    return res.json({ message: "Student allocated successfully", room: updatedRoom });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
