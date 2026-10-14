import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { body } from "../middleware/request.js";
import { AppError } from "../middleware/errors.js";
import { dbRequired, throwDb } from "../utils/db.js";

const router = Router();
const admin = [authenticate, requireRole("super_admin", "hostel_admin")];
const usernamePattern = /^[a-z0-9._-]{4,30}$/;
const normalize = (value) => String(value || "").trim().toLowerCase();
const validateUsername = (value) => { const username = normalize(value); if (!usernamePattern.test(username)) throw new AppError(400, "Username must be 4-30 characters using lowercase letters, numbers, dot, underscore, or hyphen", "VALIDATION_ERROR"); return username; };
const scopeOf = (req) => normalize(req.user.profile?.hostel || req.user.profile?.hostel_type || req.user.profile?.hostel_category);
const canManageHostel = (req, hostel) => req.role === "super_admin" || (req.role === "hostel_admin" && scopeOf(req) === hostel);
const cleanupAuthUser = async (id) => { if (id && supabaseAdmin) { try { await supabaseAdmin.auth.admin.deleteUser(id); } catch { /* best effort */ } } };

router.get("/", ...admin, async (req, res, next) => { try { const { data, error } = await dbRequired().from("user_profiles").select("id,full_name,email,username,role,student_id,hostel,status,created_at").order("created_at", { ascending: false }); throwDb(error); res.json({ data: data || [] }); } catch (error) { next(error); } });

router.post("/students", ...admin, body(["usn", "full_name", "email", "username", "hostel"]), async (req, res, next) => {
  let authUserId; let createdStudentId;
  try {
    if (!supabaseAdmin) throw new AppError(503, "Account service is not configured", "AUTH_UNAVAILABLE");
    const hostel = normalize(req.body.hostel); if (!["boys", "girls"].includes(hostel) || !canManageHostel(req, hostel)) throw new AppError(403, "You cannot create an account for this hostel", "HOSTEL_SCOPE_FORBIDDEN");
    const username = validateUsername(req.body.username); const email = normalize(req.body.email); if (!email.includes("@")) throw new AppError(400, "A valid official email is required", "VALIDATION_ERROR");
    const db = dbRequired();
    const { data: existingUsn, error: usnError } = await db.from("students").select("id").eq("usn", String(req.body.usn).trim()).maybeSingle(); throwDb(usnError); if (existingUsn) throw new AppError(409, "Student ID already exists", "DUPLICATE");
    const { data: existingEmail, error: emailError } = await db.from("students").select("id").eq("email", email).maybeSingle(); throwDb(emailError); if (existingEmail) throw new AppError(409, "Student email already exists", "DUPLICATE");
    const { data: usernameMatch, error: usernameError } = await db.from("user_profiles").select("id").eq("username", username).maybeSingle(); throwDb(usernameError); if (usernameMatch) throw new AppError(409, "Username already exists", "DUPLICATE");
    const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { account_type: "student" } }); if (inviteError || !invited.user) throw new AppError(400, "Unable to send the account invitation", "INVITE_FAILED"); authUserId = invited.user.id;
    const { data: student, error: studentError } = await db.from("students").insert({ usn: String(req.body.usn).trim(), full_name: req.body.full_name, email, phone: req.body.phone, department: req.body.department, year: req.body.year, hostel, room_id: req.body.room_id, status: "active" }).select().single(); throwDb(studentError); createdStudentId = student.id;
    const { error: profileError } = await db.from("user_profiles").upsert({ id: authUserId, email, full_name: req.body.full_name, username, role: "student", student_id: student.id, hostel, status: "active" }, { onConflict: "id" }); throwDb(profileError);
    res.status(201).json({ account: { id: authUserId, email, username, role: "student" }, student, invitationSent: true });
  } catch (error) { if (createdStudentId) { try { await dbRequired().from("students").delete().eq("id", createdStudentId); } catch { /* best effort */ } } await cleanupAuthUser(authUserId); next(error); }
});

router.post("/admins", ...admin, body(["full_name", "email", "username", "hostel"]), async (req, res, next) => {
  let authUserId;
  try {
    if (req.role !== "super_admin") throw new AppError(403, "Only a Super Admin can create hostel administrators", "FORBIDDEN");
    if (!supabaseAdmin) throw new AppError(503, "Account service is not configured", "AUTH_UNAVAILABLE");
    const hostel = normalize(req.body.hostel); if (!["boys", "girls", "all"].includes(hostel)) throw new AppError(400, "Hostel must be boys, girls, or all", "VALIDATION_ERROR");
    const username = validateUsername(req.body.username); const email = normalize(req.body.email); if (!email.includes("@")) throw new AppError(400, "A valid email is required", "VALIDATION_ERROR"); const db = dbRequired();
    const { data: usernameMatch, error: usernameError } = await db.from("user_profiles").select("id").eq("username", username).maybeSingle(); throwDb(usernameError); if (usernameMatch) throw new AppError(409, "Username already exists", "DUPLICATE");
    const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { account_type: "hostel_admin" } }); if (inviteError || !invited.user) throw new AppError(400, "Unable to send the account invitation", "INVITE_FAILED"); authUserId = invited.user.id;
    const role = hostel === "all" ? "super_admin" : "hostel_admin";
    const { error: profileError } = await db.from("user_profiles").upsert({ id: authUserId, email, full_name: req.body.full_name, username, role, hostel: hostel === "all" ? null : hostel, status: "active" }, { onConflict: "id" }); throwDb(profileError);
    res.status(201).json({ account: { id: authUserId, email, username, role, hostel }, invitationSent: true });
  } catch (error) { await cleanupAuthUser(authUserId); next(error); }
});

router.post("/:id/resend-invite", ...admin, async (req, res, next) => { try { if (!supabaseAdmin) throw new AppError(503, "Account service is not configured", "AUTH_UNAVAILABLE"); const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(req.params.id); if (userError || !user?.user?.email) throw new AppError(404, "Account not found", "NOT_FOUND"); const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(user.user.email); if (error) throw new AppError(400, "Unable to resend invitation", "INVITE_FAILED"); res.json({ invitationSent: true }); } catch (error) { next(error); } });
router.post("/:id/deactivate", ...admin, async (req, res, next) => { try { if (!supabaseAdmin) throw new AppError(503, "Account service is not configured", "AUTH_UNAVAILABLE"); const { error } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, { ban_duration: "876000h" }); if (error) throw new AppError(400, "Unable to deactivate account", "ACCOUNT_UPDATE_FAILED"); const { error: profileError } = await dbRequired().from("user_profiles").update({ status: "inactive" }).eq("id", req.params.id); throwDb(profileError); res.json({ deactivated: true }); } catch (error) { next(error); } });
export default router;
