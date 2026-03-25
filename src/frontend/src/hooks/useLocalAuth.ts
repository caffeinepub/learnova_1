import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "learner" | "instructor" | "admin";
}

const USERS_KEY = "learnova_users";
const SESSION_KEY = "learnova_session";

const DEFAULT_ADMIN: LocalUser = {
  id: "default-admin-001",
  email: "admin@learnova.com",
  password: "admin123",
  name: "Admin",
  role: "admin",
};

function ensureDefaultAdmin(users: LocalUser[]): LocalUser[] {
  const hasDefault = users.find((u) => u.id === DEFAULT_ADMIN.id);
  if (!hasDefault) {
    return [DEFAULT_ADMIN, ...users];
  }
  return users;
}

function getUsers(): LocalUser[] {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return ensureDefaultAdmin(stored);
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setSessionUserId(id: string | null) {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
}

export function useLocalAuth() {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() => {
    const id = getSessionUserId();
    if (!id) return null;
    return getUsers().find((u) => u.id === id) ?? null;
  });

  // localStorage is synchronous — no need to wait for an effect, start as true
  const [isInitialized] = useState(true);

  useEffect(() => {
    // Ensure default admin always exists in storage
    const users = getUsers();
    saveUsers(users);
  }, []);

  const login = useCallback(
    (
      email: string,
      password: string,
    ): { success: boolean; role?: LocalUser["role"]; error?: string } => {
      const users = getUsers();
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      if (!user) return { success: false, error: "Invalid email or password." };
      setSessionUserId(user.id);
      flushSync(() => {
        setCurrentUser(user);
      });
      return { success: true, role: user.role };
    },
    [],
  );

  const signup = useCallback(
    (
      email: string,
      password: string,
      name: string,
      role: "learner" | "instructor",
    ): { success: boolean; role?: LocalUser["role"]; error?: string } => {
      const users = getUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
      const newUser: LocalUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role,
      };
      saveUsers([...users, newUser]);
      setSessionUserId(newUser.id);
      flushSync(() => {
        setCurrentUser(newUser);
      });
      return { success: true, role };
    },
    [],
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    flushSync(() => {
      setCurrentUser(null);
    });
  }, []);

  const updateUser = useCallback(
    (updates: Partial<Pick<LocalUser, "name" | "email">>) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        const users = getUsers().map((u) => (u.id === prev.id ? updated : u));
        saveUsers(users);
        return updated;
      });
    },
    [],
  );

  const isFirstUser = (): boolean => {
    // Always returns false since default admin exists
    return false;
  };

  const resetAllAccounts = useCallback(() => {
    // Keep the default admin, only remove user-created accounts
    saveUsers([DEFAULT_ADMIN]);
    localStorage.removeItem(SESSION_KEY);
    flushSync(() => {
      setCurrentUser(null);
    });
  }, []);

  return {
    currentUser,
    isInitialized,
    login,
    signup,
    logout,
    updateUser,
    isFirstUser,
    resetAllAccounts,
    defaultAdminEmail: DEFAULT_ADMIN.email,
    defaultAdminPassword: DEFAULT_ADMIN.password,
  };
}
