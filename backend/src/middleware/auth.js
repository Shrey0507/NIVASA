import { supabaseAdmin, getSupabaseForToken } from "../config/supabase.js";
import { AppError } from "./errors.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
    if (!token) throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
    const client = getSupabaseForToken(token);
    if (!client || !supabaseAdmin) throw new AppError(503, "Authentication service is not configured", "AUTH_UNAVAILABLE");
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) throw new AppError(401, "Invalid or expired access token", "INVALID_TOKEN");
    const { data: profile, error: profileError } = await supabaseAdmin.from("user_profiles").select("*").eq("id", data.user.id).maybeSingle();
    if (profileError) throw new AppError(503, "Unable to load authorization profile", "AUTH_PROFILE_UNAVAILABLE");
    req.user = { id: data.user.id, email: data.user.email, profile: profile || null, token };
    req.role = profile?.role || data.user.user_metadata?.role || "student";
    req.studentId = profile?.student_id || profile?.studentId || null;
    next();
  } catch (err) { next(err); }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
  if (!roles.includes(req.role)) return next(new AppError(403, "You do not have permission to perform this action", "FORBIDDEN"));
  next();
};

export const requireStudent = (req, res, next) => {
  if (req.role !== "student" || !req.studentId) return next(new AppError(403, "A linked student profile is required", "STUDENT_PROFILE_REQUIRED"));
  next();
};
