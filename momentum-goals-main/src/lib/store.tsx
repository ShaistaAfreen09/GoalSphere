import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { INITIAL_AUDIT, INITIAL_GOALS, USERS, type AuditLog, type Goal, type Role, type User } from "./mock-data";

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  currentUser: User;
  users: User[];
  goals: Goal[];
  setGoals: (g: Goal[] | ((prev: Goal[]) => Goal[])) => void;
  audit: AuditLog[];
  logAudit: (action: string, target: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("employee");
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [audit, setAudit] = useState<AuditLog[]>(INITIAL_AUDIT);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const currentUser = useMemo(() => {
    if (role === "manager") return USERS.find((u) => u.role === "manager")!;
    if (role === "admin") return USERS.find((u) => u.role === "admin")!;
    return USERS.find((u) => u.role === "employee")!;
  }, [role]);

  const logAudit = (action: string, target: string) => {
    setAudit((prev) => [
      { id: `a${Date.now()}`, at: new Date().toISOString(), actor: currentUser.name, action, target },
      ...prev,
    ]);
  };

  return (
    <Ctx.Provider
      value={{
        role, setRole, currentUser, users: USERS, goals, setGoals, audit, logAudit,
        theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};
