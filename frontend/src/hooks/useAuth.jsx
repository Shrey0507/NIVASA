import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import supabase from "@/lib/supabase";
import { apiRequest } from "@/lib/apiClient";

export const ADMIN_ROLES = {
  super: { label: "Administrator", hostel: null },
  boys: { label: "Boys' Hostel Administrator", hostel: "boys" },
  girls: { label: "Girls' Hostel Administrator", hostel: "girls" },
};
const INITIAL = { isAuthenticated: false, loading: true, role: null, hostel: null, user: null, profile: null, student: null };
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(INITIAL);
  const loadSession = useCallback(async (session) => {
    if (!session) return setAuth({ ...INITIAL, loading: false });
    try {
      const me = await apiRequest("/auth/me");
      const profile = me.profile || {};
      const isStudent = me.role === "student";
      const student = isStudent ? (me.student || profile.student || profile.student_record || profile) : null;
      setAuth({ isAuthenticated: true, loading: false, role: isStudent ? "student" : "super", hostel: profile.hostel || null, user: profile.full_name || session.user.email, profile, student });
    } catch { await supabase.auth.signOut(); setAuth({ ...INITIAL, loading: false }); }
  }, []);
  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => loadSession(session)); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => loadSession(session)); return () => subscription.unsubscribe(); }, [loadSession]);
  const login = useCallback(async (identifier, password) => { const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }); await supabase.auth.setSession(result.session); await loadSession(result.session); return result; }, [loadSession]);
  const logout = useCallback(async () => { await supabase.auth.signOut(); setAuth({ ...INITIAL, loading: false }); }, []);
  const value = useMemo(() => ({ ...auth, login, logout, loginAdmin: login, loginStudent: login, getHostelFilter: () => auth.hostel, canAccessHostel: (hostel) => auth.role === "super" || auth.hostel === hostel }), [auth, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
