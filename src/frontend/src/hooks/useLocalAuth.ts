import { useCallback, useEffect, useState } from "react";

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "learner" | "instructor" | "admin";
}

const USERS_KEY = "learnova_users";
const SESSION_KEY = "learnova_session";

function getUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
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

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
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
      setCurrentUser(user);
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
      // First account ever automatically becomes admin
      const assignedRole: LocalUser["role"] =
        users.length === 0 ? "admin" : role;
      const newUser: LocalUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role: assignedRole,
      };
      saveUsers([...users, newUser]);
      setSessionUserId(newUser.id);
      setCurrentUser(newUser);
      return { success: true, role: assignedRole };
    },
    [],
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    setCurrentUser(null);
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

  const isFirstUser = (): boolean => getUsers().length === 0;

  return {
    currentUser,
    isInitialized,
    login,
    signup,
    logout,
    updateUser,
    isFirstUser,
  };
}
