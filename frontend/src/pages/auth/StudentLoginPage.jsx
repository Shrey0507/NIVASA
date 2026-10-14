import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase";

export default function StudentLoginPage() {
  const navigate = useNavigate(); const { login } = useAuth(); const [form, setForm] = useState({ identifier: "", password: "" }); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => { e.preventDefault(); setError(""); setMessage(""); if (!form.identifier || !form.password) return setError("Username/email and password are required."); setSubmitting(true); try { await login(form.identifier, form.password); navigate("/student"); } catch { setError("Unable to sign in. Check your credentials or contact the hostel office."); } finally { setSubmitting(false); } };
  const reset = async () => { if (!form.identifier.includes("@")) return setError("Enter your account email to request a reset link."); const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.identifier, { redirectTo: `${window.location.origin}/student/login` }); if (resetError) setError("Unable to send a reset email."); else setMessage("If the account exists, a password reset email has been sent."); };
  return <AuthLayout footer={<p className="mt-6 text-center text-sm text-white/60">Are you an administrator? <Link to="/admin/login" className="font-medium text-violet-300 hover:underline">Admin sign in</Link></p>}>
    <h1 className="text-2xl font-semibold tracking-tight text-white">Student sign in</h1><p className="mt-2 text-sm text-white/70">Use your provisioned username or email.</p>
    <form onSubmit={submit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="identifier" className="text-white/85">Username or email</Label><div className="relative"><User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"/><Input id="identifier" className="border-white/15 bg-white/10 pl-9 text-white" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} autoComplete="username"/></div></div><div className="space-y-2"><Label htmlFor="password" className="text-white/85">Password</Label><div className="relative"><Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"/><Input id="password" type="password" className="border-white/15 bg-white/10 pl-9 text-white" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"/></div></div>{error && <p className="text-sm text-rose-300">{error}</p>}{message && <p className="text-sm text-emerald-300">{message}</p>}<Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}{!submitting && <ArrowRight/>}</Button><button type="button" className="w-full text-sm text-violet-300 hover:underline" onClick={reset}>Forgot password?</button></form>
  </AuthLayout>;
}
