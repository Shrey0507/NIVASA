import { useNavigate } from "react-router-dom";

import { AppShell } from "./AppShell";
import { adminNav } from "@/config/navigation";
import { useAuth, ADMIN_ROLES } from "@/hooks/useAuth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const roleLabel = ADMIN_ROLES[role]?.label ?? "Admin";

  return (
    <AppShell
      nav={adminNav}
      subtitle="Admin Console"
      user={user || "Admin"}
      role={roleLabel}
      onLogout={() => {
        logout();
        navigate("/admin/login");
      }}
    />
  );
}
