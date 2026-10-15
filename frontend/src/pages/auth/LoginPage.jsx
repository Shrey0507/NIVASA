import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Shield, GraduationCap } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/apiClient";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * LoginPage — Two primary login options: Admin Login and Student Login.
 *
 * Accepts an optional initialMode prop ("admin" | "student") so that
 * /admin/login and /student/login open the correct form directly.
 *
 * Authorization is ALWAYS determined server-side via the user_profiles table.
 * The mode selector only controls the login experience — it never grants
 * privileges.
 */
export default function LoginPage({ initialMode }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode || null); // null = chooser, "admin" | "student"
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.identifier.trim() || !form.password)
      return setError("Email/username and password are required.");
    setLoading(true);
    try {
      const result = await login(form.identifier, form.password);
      // After login, /auth/me is called by the AuthProvider to determine the
      // authoritative role. We read the role from the auth context indirectly
      // by calling /auth/me ourselves for the redirect target.
      const me = await apiRequest("/auth/me");
      const role = me.role;

      // Route based on server-determined role
      if (role === "student") {
        navigate("/student", { replace: true });
      } else {
        // super_admin, hostel_admin, warden, admin — all go to admin dashboard
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setError(
        err?.message || "Unable to sign in. Check your credentials or contact the hostel office."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setError("");
    setMessage("");
    if (!form.identifier.includes("@"))
      return setError("Enter your registered email to request a reset link.");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      form.identifier,
      { redirectTo: `${window.location.origin}/login` }
    );
    if (resetError) setError("Unable to send a reset email.");
    else setMessage("If the account exists, a password reset email has been sent.");
  };

  // ── Mode Chooser ──────────────────────────────────────────────────────
  if (!mode) {
    return (
      <AuthLayout
        footer={
          <p className="mt-6 text-center text-sm text-white/60">
            NIVASA accounts are provisioned by authorized hostel administrators.
          </p>
        }
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white text-center">
          Welcome to NIVASA
        </h1>
        <p className="mt-2 text-sm text-white/70 text-center">
          Select how you would like to sign in.
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => setMode("admin")}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all hover:border-violet-400/40 hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            id="admin-login-option"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 transition-colors group-hover:bg-violet-500/30">
              <Shield className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Admin Login</p>
              <p className="text-xs text-white/50">
                Super Admin &middot; Boys Hostel Admin &middot; Girls Hostel Admin
              </p>
            </div>
            <ArrowRight className="size-4 text-white/30 transition-colors group-hover:text-violet-300" />
          </button>

          <button
            type="button"
            onClick={() => setMode("student")}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all hover:border-emerald-400/40 hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            id="student-login-option"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 transition-colors group-hover:bg-emerald-500/30">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Student Login</p>
              <p className="text-xs text-white/50">
                Access your profile, fees, mess menu &amp; more
              </p>
            </div>
            <ArrowRight className="size-4 text-white/30 transition-colors group-hover:text-emerald-300" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Login Form (shared by both admin and student modes) ───────────────
  const isAdmin = mode === "admin";
  const accentClasses = isAdmin
    ? { ring: "focus-visible:ring-violet-400", btn: "" }
    : { ring: "focus-visible:ring-emerald-400", btn: "" };

  return (
    <AuthLayout
      footer={
        <p className="mt-6 text-center text-sm text-white/60">
          NIVASA accounts are provisioned by authorized hostel administrators.
        </p>
      }
    >
      {/* Back button — only when not arriving from a direct URL */}
      {!initialMode && (
        <button
          type="button"
          onClick={() => { setMode(null); setError(""); setMessage(""); setForm({ identifier: "", password: "" }); }}
          className="mb-4 flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
      )}

      <div className="flex items-center gap-3 mb-1">
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${isAdmin ? "bg-violet-500/20 text-violet-300" : "bg-emerald-500/20 text-emerald-300"}`}
        >
          {isAdmin ? <Shield className="size-4" /> : <GraduationCap className="size-4" />}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {isAdmin ? "Admin Login" : "Student Login"}
        </h1>
      </div>
      <p className="mt-2 text-sm text-white/70">
        {isAdmin
          ? "Sign in with your administrator credentials."
          : "Sign in with your student email or username."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-white/85">
            Email or username
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              id="identifier"
              required
              className="border-white/15 bg-white/10 pl-9 text-white"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              autoComplete="username"
              placeholder={isAdmin ? "admin@institution.edu" : "student@institution.edu"}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/85">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              id="password"
              required
              type={showPassword ? "text" : "password"}
              className="border-white/15 bg-white/10 pl-9 pr-10 text-white"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {message && <p className="text-sm text-emerald-300">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in\u2026" : "Sign in"}
          {!loading && <ArrowRight className="ml-1 size-4" />}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-violet-300 hover:underline"
          onClick={reset}
        >
          Forgot password?
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-white/50">
        {isAdmin ? (
          <Link to="/student/login" className="hover:underline">
            Sign in as Student instead
          </Link>
        ) : (
          <Link to="/admin/login" className="hover:underline">
            Sign in as Admin instead
          </Link>
        )}
      </p>
    </AuthLayout>
  );
}
