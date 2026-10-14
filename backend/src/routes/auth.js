import { Router } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { body } from "../middleware/request.js";
import { AppError } from "../middleware/errors.js";

const router = Router();
const usernamePattern = /^[a-z0-9._-]{4,30}$/;

router.post("/login", body(["identifier", "password"]), async (req, res, next) => {
  try {
    if (!supabase || !supabaseAdmin) throw new AppError(503, "Authentication service is not configured", "AUTH_UNAVAILABLE");
    const identifier = String(req.body.identifier).trim();
    const password = String(req.body.password);
    let email = identifier;
    if (!identifier.includes("@")) {
      const username = identifier.toLowerCase();
      if (!usernamePattern.test(username)) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
      const { data: profile, error: lookupError } = await supabaseAdmin.from("user_profiles").select("email").eq("username", username).maybeSingle();
      if (lookupError || !profile?.email) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
      email = profile.email;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    res.json({ session: data.session, user: data.user });
  } catch (error) { next(error); }
});

export default router;
