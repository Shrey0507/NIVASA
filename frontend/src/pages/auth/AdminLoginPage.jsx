import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEMO = { email: "admin@sjbit.edu.in", password: "admin123" };

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "super" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address";
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
    loginAdmin(form.role, "Admin");
    setTimeout(() => navigate("/admin"), 500);
  };

  return (
    <AuthLayout
      footer={
        <p className="mt-6 text-center text-sm text-white/60">
          Are you a resident?{" "}
          <Link
            to="/student/login"
            className="font-medium text-violet-300 hover:underline"
          >
            Student sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin sign in
        </h1>
        <p className="text-sm text-white/70">
          Sign in to manage the hostel operations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/85">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              id="email"
              type="email"
              placeholder="admin@sjbit.edu.in"
              className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/40 focus-visible:ring-violet-500/40"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-300">{errors.email}</p>}
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
          {errors.password && <p className="text-xs text-rose-300">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-role" className="text-white/85">
            Admin role
          </Label>
          <Select value={form.role} onValueChange={(v) => update("role", v)}>
            <SelectTrigger
              id="admin-role"
              className="border-white/15 bg-white/10 text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super">Super Admin (All hostels)</SelectItem>
              <SelectItem value="boys">Boys' Hostel Admin</SelectItem>
              <SelectItem value="girls">Girls' Hostel Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
          {!submitting && <ArrowRight />}
        </Button>
      </form>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/65">
        <p className="font-medium text-white">Demo credentials</p>
        <p className="mt-0.5">
          {DEMO.email} · {DEMO.password}
        </p>
        <button
          type="button"
          className="mt-1 font-medium text-violet-300 hover:underline"
          onClick={() => setForm({ ...DEMO, role: form.role })}
        >
          Fill demo credentials
        </button>
      </div>
    </AuthLayout>
  );
}
