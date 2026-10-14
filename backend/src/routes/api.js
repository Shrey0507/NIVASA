import { Router } from "express";
import { authenticate, requireRole, requireStudent } from "../middleware/auth.js";
import { body, pagination, asId } from "../middleware/request.js";
import { AppError } from "../middleware/errors.js";
import { dbRequired, throwDb, pageResult, cleanPatch } from "../utils/db.js";

const router = Router();
const admin = [authenticate, requireRole("admin", "super_admin", "warden")];
const staffOrStudent = [authenticate];
const tables = { fees: "fee_records", mess: "mess_menus" };
const send = (res, data, status = 200) => res.status(status).json(data);
const queryList = async (table, req, build = (q) => q) => {
  const db = dbRequired(); let q = db.from(table).select("*", { count: "exact" }).range(req.pagination.from, req.pagination.to);
  q = build(q); const { data, count, error } = await q; throwDb(error); return pageResult(data, count, req.pagination);
};
const ownerFilter = (req, q, column = "student_id") => req.role === "student" ? q.eq(column, req.studentId) : q;

router.get("/auth/me", authenticate, async (req, res, next) => {
  try {
    let student = null;
    if (req.studentId) {
      const { data, error } = await dbRequired().from("students").select("*").eq("id", req.studentId).maybeSingle();
      throwDb(error);
      student = data;
    }
    send(res, { user: { id: req.user.id, email: req.user.email }, role: req.role, studentId: req.studentId, profile: req.user.profile, student });
  } catch (error) { next(error); }
});

router.get("/students", ...admin, pagination, async (req, res, next) => { try { const out = await queryList("students", req, (q) => { const { search, hostel, status, department } = req.query; if (hostel && hostel !== "all") q = q.eq("hostel", hostel); if (status && status !== "all") q = q.eq("status", status); if (department) q = q.eq("department", department); if (search) { const s = String(search).replace(/[(),]/g, " "); q = q.or(`full_name.ilike.%${s}%,usn.ilike.%${s}%,email.ilike.%${s}%`); } return q.order("created_at", { ascending: false }); }); send(res, out); } catch (e) { next(e); } });
router.get("/students/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from("students").select("*").eq("id", asId(req.params.id)).maybeSingle(); throwDb(error); if (!data) throw new AppError(404, "Student not found", "NOT_FOUND"); send(res, data); } catch (e) { next(e); } });
router.post("/students", ...admin, body(["usn", "full_name", "email", "hostel"]), async (req, res, next) => { try { const allowed = ["usn", "full_name", "email", "phone", "department", "year", "hostel", "guardian_details", "address", "emergency_contact", "status"]; const { data, error } = await dbRequired().from("students").insert(cleanPatch(req.body, allowed)).select().single(); if (error?.code === "23505") throw new AppError(409, "Student ID or email already exists", "DUPLICATE"); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.patch("/students/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from("students").update(cleanPatch(req.body, ["usn", "full_name", "email", "phone", "department", "year", "hostel", "guardian_details", "address", "emergency_contact", "status"])).eq("id", asId(req.params.id)).select().maybeSingle(); throwDb(error); if (!data) throw new AppError(404, "Student not found", "NOT_FOUND"); send(res, data); } catch (e) { next(e); } });
router.delete("/students/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from("students").update({ status: "inactive" }).eq("id", asId(req.params.id)).select().maybeSingle(); throwDb(error); if (!data) throw new AppError(404, "Student not found", "NOT_FOUND"); send(res, data); } catch (e) { next(e); } });

for (const [path, table] of [["hostels", "hostels"], ["blocks", "blocks"], ["rooms", "rooms"]]) {
  router.get(`/${path}`, ...staffOrStudent, pagination, async (req, res, next) => { try { send(res, await queryList(table, req, (q) => { if (req.query.hostel_id) q = q.eq("hostel_id", req.query.hostel_id); if (req.query.block_id) q = q.eq("block_id", req.query.block_id); if (req.query.status) q = q.eq("status", req.query.status); return q; })); } catch (e) { next(e); } });
  router.post(`/${path}`, ...admin, body(path === "rooms" ? ["hostel_id", "room_number", "capacity"] : ["name"]), async (req, res, next) => { try { const allowed = path === "rooms" ? ["hostel_id", "block_id", "floor", "room_number", "capacity", "facilities", "status"] : path === "blocks" ? ["hostel_id", "name", "floor_count"] : ["name", "location", "gender", "capacity"]; const { data, error } = await dbRequired().from(table).insert(cleanPatch(req.body, allowed)).select().single(); if (error?.code === "23505") throw new AppError(409, "Resource already exists", "DUPLICATE"); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
}

router.post("/allocations", ...admin, body(["student_id", "room_id"]), async (req, res, next) => { try { const { data, error } = await dbRequired().rpc("allocate_room", { p_student_id: req.body.student_id, p_room_id: req.body.room_id }); if (error) { if (error.code === "42883") throw new AppError(501, "Atomic allocation function is not installed; apply the additive migration first", "MIGRATION_REQUIRED"); throwDb(error); } send(res, data, 201); } catch (e) { next(e); } });
router.delete("/allocations/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().rpc("vacate_room", { p_allocation_id: asId(req.params.id) }); if (error) { if (error.code === "42883") throw new AppError(501, "Atomic vacation function is not installed; apply the additive migration first", "MIGRATION_REQUIRED"); throwDb(error); } send(res, data); } catch (e) { next(e); } });

const listOwned = (path, table, roles = ["admin", "super_admin", "warden", "student"]) => {
  router.get(path, authenticate, requireRole(...roles), pagination, async (req, res, next) => { try { send(res, await queryList(table, req, (q) => { q = ownerFilter(req, q); if (req.query.status) q = q.eq("status", req.query.status); return q.order("created_at", { ascending: false }); })); } catch (e) { next(e); } });
};
listOwned("/fees", tables.fees); listOwned("/movements", "movements"); listOwned("/grievances", "grievances");
router.post("/fees", ...admin, body(["student_id", "amount", "fee_type", "due_date"]), async (req, res, next) => { try { const { data, error } = await dbRequired().from(tables.fees).insert(cleanPatch(req.body, ["student_id", "amount", "fee_type", "due_date", "status", "payment_method", "reference"])).select().single(); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.patch("/fees/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from(tables.fees).update(cleanPatch(req.body, ["amount", "fee_type", "due_date", "paid_date", "status", "payment_method", "reference"])).eq("id", asId(req.params.id)).select().single(); throwDb(error); send(res, data); } catch (e) { next(e); } });
router.post("/movements", authenticate, requireStudent, body(["movement_type", "destination", "reason", "expected_return"]), async (req, res, next) => { try { const { data, error } = await dbRequired().from("movements").insert({ ...cleanPatch(req.body, ["movement_type", "destination", "reason", "expected_return", "expected_return_time"]), student_id: req.studentId }).select().single(); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.post("/movements/:id/return", authenticate, async (req, res, next) => { try { let q = dbRequired().from("movements").update({ actual_return: new Date().toISOString(), actual_return_time: new Date().toISOString(), status: "returned" }).eq("id", asId(req.params.id)); if (req.role === "student") q = q.eq("student_id", req.studentId); const { data, error } = await q.select().maybeSingle(); throwDb(error); if (!data) throw new AppError(404, "Movement not found", "NOT_FOUND"); send(res, data); } catch (e) { next(e); } });
router.post("/grievances", authenticate, requireStudent, body(["title", "category", "description"]), async (req, res, next) => { try { const { data, error } = await dbRequired().from("grievances").insert({ ...cleanPatch(req.body, ["title", "category", "description"]), student_id: req.studentId }).select().single(); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.patch("/grievances/:id", ...admin, async (req, res, next) => { try { const patch = cleanPatch(req.body, ["status", "priority", "response", "resolution_notes", "assigned_to", "resolved_at"]); const { data, error } = await dbRequired().from("grievances").update(patch).eq("id", asId(req.params.id)).select().single(); throwDb(error); send(res, data); } catch (e) { next(e); } });

router.get("/notices", authenticate, pagination, async (req, res, next) => { try { const now = new Date().toISOString(); send(res, await queryList("notices", req, (q) => q.lte("published_at", now).or(`expires_at.is.null,expires_at.gte.${now}`).order("is_pinned", { ascending: false }).order("published_at", { ascending: false }))); } catch (e) { next(e); } });
router.post("/notices", ...admin, body(["title", "content"]), async (req, res, next) => { try { const { data, error } = await dbRequired().from("notices").insert(cleanPatch(req.body, ["title", "content", "audience", "target_audience", "published_at", "expires_at", "is_pinned"])).select().single(); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.patch("/notices/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from("notices").update(cleanPatch(req.body, ["title", "content", "audience", "target_audience", "published_at", "expires_at", "is_pinned"])).eq("id", asId(req.params.id)).select().single(); throwDb(error); send(res, data); } catch (e) { next(e); } });
router.delete("/notices/:id", ...admin, async (req, res, next) => { try { const { error } = await dbRequired().from("notices").delete().eq("id", asId(req.params.id)); throwDb(error); send(res, { deleted: true }); } catch (e) { next(e); } });

router.get("/mess", authenticate, pagination, async (req, res, next) => { try { send(res, await queryList(tables.mess, req, (q) => q.order("menu_date", { ascending: true }))); } catch (e) { next(e); } });
router.post("/mess", ...admin, body(["menu_date"]), async (req, res, next) => { try { const { data, error } = await dbRequired().from(tables.mess).insert(cleanPatch(req.body, ["menu_date", "breakfast", "lunch", "snacks", "dinner", "timings"])).select().single(); throwDb(error); send(res, data, 201); } catch (e) { next(e); } });
router.patch("/mess/:id", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from(tables.mess).update(cleanPatch(req.body, ["menu_date", "breakfast", "lunch", "snacks", "dinner", "timings"])).eq("id", asId(req.params.id)).select().single(); throwDb(error); send(res, data); } catch (e) { next(e); } });

router.get("/dashboard", authenticate, async (req, res, next) => { try { const db = dbRequired(); const names = ["students", "rooms", tables.fees, "grievances", "movements", "notices"]; const results = await Promise.all(names.map((table) => { let q = db.from(table).select("id", { count: "exact", head: true }); if (req.role === "student" && [tables.fees, "grievances", "movements"].includes(table)) q = q.eq("student_id", req.studentId); return q; })); const counts = Object.fromEntries(names.map((name, i) => [name, results[i].count || 0])); if (results.some((r) => r.error)) throw new AppError(503, "Dashboard data is unavailable", "DATABASE_ERROR"); send(res, { counts, generatedAt: new Date().toISOString() }); } catch (e) { next(e); } });

export default router;
