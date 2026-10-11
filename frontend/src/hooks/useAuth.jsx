import { createContext, useContext, useState, useCallback } from "react";

/**
 * Lightweight auth context for NIVASA.
 *
 * ⚠️ FRONTEND-ONLY DEMONSTRATION.
 * This context does NOT provide real security. Hostel data isolation is
 * enforced via UI filtering only. A production deployment MUST enforce
 * access control on the server (e.g. Supabase RLS, API middleware).
 *
 * Admin roles:
 *   - "super"  → can see both hostels (Boys' + Girls')
 *   - "boys"   → restricted to Boys' Hostel data
 *   - "girls"  → restricted to Girls' Hostel data
 *
 * Student role:
 *   - "student" → the currently signed-in student
 */

const AuthContext = createContext(null);

export const ADMIN_ROLES = {
  super: { label: "Super Admin", hostel: null },
  boys: { label: "Boys' Hostel Admin", hostel: "boys" },
  girls: { label: "Girls' Hostel Admin", hostel: "girls" },
};

const INITIAL_AUTH = {
  isAuthenticated: false,
  role: null, // "super" | "boys" | "girls" | "student"
  hostel: null, // null (super/student), "boys", "girls"
  user: null,
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(INITIAL_AUTH);

  const loginAdmin = useCallback((role = "super", user = "Admin") => {
    const hostel = ADMIN_ROLES[role]?.hostel ?? null;
    setAuth({ isAuthenticated: true, role, hostel, user });
  }, []);

  const loginStudent = useCallback((student) => {
    setAuth({
      isAuthenticated: true,
      role: "student",
      hostel: student?.hostelType ?? null,
      user: student?.fullName ?? "Student",
    });
  }, []);

  const logout = useCallback(() => {
    setAuth(INITIAL_AUTH);
  }, []);

  /**
   * Returns the hostel filter that should be applied to data queries.
   * - Super admin → null (no filter — sees everything)
   * - Boys/Girls admin → "boys" / "girls"
   */
  const getHostelFilter = useCallback(() => auth.hostel, [auth.hostel]);

  /**
   * Check if the user is authorized to view/manage a specific hostel's data.
   * @param {"boys" | "girls"} hostelKey
   */
  const canAccessHostel = useCallback(
    (hostelKey) => {
      if (!auth.isAuthenticated) return false;
      if (auth.role === "super") return true;
      return auth.hostel === hostelKey;
    },
    [auth],
  );

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        loginAdmin,
        loginStudent,
        logout,
        getHostelFilter,
        canAccessHostel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
