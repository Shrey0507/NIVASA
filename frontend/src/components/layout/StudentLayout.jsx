import { useNavigate } from "react-router-dom";

import { AppShell } from "./AppShell";
import { studentNav } from "@/config/navigation";
import { currentStudent } from "@/data/studentData";
import { useAuth } from "@/hooks/useAuth";

export default function StudentLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <AppShell
      nav={studentNav}
      subtitle="Student Portal"
      user={user || currentStudent.fullName}
      role={`${currentStudent.department} · ${currentStudent.class}`}
      onLogout={() => {
        logout();
        navigate("/student/login");
      }}
    />
  );
}
