import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, User } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { currentStudent } from "@/data/studentData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO = { usn: "1MS22CS001", password: "student123" };

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const [form, setForm] = useState({ usn: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.usn.trim()) next.usn = "USN is required";
    else if (form.usn.trim().length < 6) next.usn = "Enter a valid USN";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Prototype only — no real authentication happens here.
    loginStudent(currentStudent);
    setTimeout(() => navigate("/student"), 500);
  };

  return (
    <AuthLayout
      footer={
        <p className="mt-6 text-center text-sm text-white/60">
          Are you an administrator?{" "}
          <Link
            to="/admin/login"
            className="font-medium text-violet-300 hover:underline"
          >
            Admin sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Student sign in
        </h1>
        <p className="text-sm text-white/70">
          Access your room, fees, mess menu and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="usn" className="text-white/85">
            USN
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              id="usn"
              placeholder="1MS22CS001"
              className="border-white/15 bg-white/10 pl-9 uppercase text-white placeholder:normal-case placeholder:text-white/40 focus-visible:ring-violet-500/40"
              value={form.usn}
              onChange={(e) => update("usn", e.target.value.toUpperCase())}
              autoComplete="username"
            />
          </div>
          {errors.usn && <p className="text-xs text-rose-300">{errors.usn}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/85">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/40 focus-visible:ring-violet-500/40"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-300">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
          {!submitting && <ArrowRight />}
        </Button>
      </form>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/65">
        <p className="font-medium text-white">Demo credentials</p>
        <p className="mt-0.5">
          {DEMO.usn} · {DEMO.password}
        </p>
        <button
          type="button"
          className="mt-1 font-medium text-violet-300 hover:underline"
          onClick={() => setForm({ ...DEMO })}
        >
          Fill demo credentials
        </button>
      </div>
    </AuthLayout>
  );
}
