import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "instructor" | "learner";
}

const SESSION_KEY = "learnova_session";

function readSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id && parsed.email && parsed.role) return parsed as LocalUser;
    return null;
  } catch {
    return null;
  }
}

function writeSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function normalizeRole(role: string): LocalUser["role"] {
  if (role === "admin" || role === "instructor" || role === "learner")
    return role;
  return "learner";
}

export function useGlobalAuth() {
  const { actor, isFetching } = useActor();
  const ii = useInternetIdentity();
  const { identity } = ii;

  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() =>
    readSession(),
  );
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const [needsIIRegistration, setNeedsIIRegistration] = useState(false);

  const [authReady] = useState(true);
  const isInitialized = authReady;

  const loadIISession = useCallback(async (): Promise<boolean> => {
    if (!identity || identity.getPrincipal().isAnonymous() || !actor)
      return false;
    const principal = identity.getPrincipal().toString();
    const savedRole = localStorage.getItem(`learnova_role_${principal}`);
    if (!savedRole) return false;
    try {
      const profile = await actor.getUserProfile(identity.getPrincipal());
      const user: LocalUser = {
        id: `ii:${principal}`,
        email: profile.email,
        name: profile.name,
        role: normalizeRole(savedRole),
      };
      writeSession(user);
      flushSync(() => setCurrentUser(user));
      return true;
    } catch {
      return false;
    }
  }, [identity, actor]);

  useEffect(() => {
    if (!identity || identity.getPrincipal().isAnonymous()) return;
    if (currentUserRef.current) return;
    if (!actor) return;

    const principal = identity.getPrincipal().toString();
    const savedRole = localStorage.getItem(`learnova_role_${principal}`);
    if (savedRole) {
      void loadIISession();
    } else {
      setNeedsIIRegistration(true);
    }
  }, [identity, actor, loadIISession]);

  const finishIIRegistration = useCallback(async () => {
    setNeedsIIRegistration(false);
    const loaded = await loadIISession();
    if (!loaded) setNeedsIIRegistration(true);
  }, [loadIISession]);

  const clearIIRegistration = useCallback(() => {
    setNeedsIIRegistration(false);
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{
      success: boolean;
      role?: LocalUser["role"];
      error?: string;
    }> => {
      if (!actor)
        return {
          success: false,
          error: "Service not ready. Please try again in a moment.",
        };
      try {
        const result = await actor.loginEmailUser(email, password);
        if (result.__kind__ === "err") {
          return { success: false, error: result.err };
        }
        const u = result.ok;
        const user: LocalUser = {
          id: u.id,
          email: u.email,
          name: u.name,
          role: normalizeRole(u.role),
        };
        writeSession(user);
        flushSync(() => setCurrentUser(user));
        return { success: true, role: user.role };
      } catch {
        return { success: false, error: "Login failed. Please try again." };
      }
    },
    [actor],
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: "learner" | "instructor",
    ): Promise<{
      success: boolean;
      role?: LocalUser["role"];
      error?: string;
    }> => {
      if (!actor)
        return {
          success: false,
          error: "Service not ready. Please try again in a moment.",
        };
      try {
        const result = await actor.registerEmailUser(
          email,
          password,
          name,
          role,
        );
        if (result.__kind__ === "err") {
          return { success: false, error: result.err };
        }
        const u = result.ok;
        const user: LocalUser = {
          id: u.id,
          email: u.email,
          name: u.name,
          role: normalizeRole(u.role),
        };
        writeSession(user);
        flushSync(() => setCurrentUser(user));
        return { success: true, role: user.role };
      } catch {
        return { success: false, error: "Signup failed. Please try again." };
      }
    },
    [actor],
  );

  const logout = useCallback(() => {
    // Only clear II session for II users. For email/password users, clearing the
    // II AuthClient causes it to be recreated which temporarily nulls the actor
    // and breaks the next login attempt.
    const isIIUser = currentUserRef.current?.id?.startsWith("ii:");
    writeSession(null);
    flushSync(() => setCurrentUser(null));
    if (isIIUser) {
      ii.clear();
    }
  }, [ii]);

  const updateUser = useCallback(
    (updates: Partial<Pick<LocalUser, "name" | "email">>) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        writeSession(updated);
        return updated;
      });
    },
    [],
  );

  const resetAllAccounts = useCallback(async () => {
    if (!actor) return;
    try {
      await actor.resetEmailUsers();
    } catch (e) {
      console.error("resetEmailUsers failed", e);
    }
    writeSession(null);
    flushSync(() => setCurrentUser(null));
  }, [actor]);

  const getAllUsers = useCallback(async (): Promise<LocalUser[]> => {
    if (!actor) return [];
    try {
      const users = await actor.getAllEmailUsers();
      return users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: normalizeRole(u.role),
      }));
    } catch {
      return [];
    }
  }, [actor]);

  const updateUserRole = useCallback(
    async (
      id: string,
      role: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!actor) return { success: false, error: "Service not ready" };
      try {
        const result = await actor.updateEmailUserRole(id, role);
        if (result.__kind__ === "err")
          return { success: false, error: result.err };
        return { success: true };
      } catch {
        return { success: false, error: "Failed to update role" };
      }
    },
    [actor],
  );

  const deleteUser = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!actor) return { success: false, error: "Service not ready" };
      try {
        const result = await actor.deleteEmailUser(id);
        if (result.__kind__ === "err")
          return { success: false, error: result.err };
        return { success: true };
      } catch {
        return { success: false, error: "Failed to delete user" };
      }
    },
    [actor],
  );

  void isFetching;

  return {
    currentUser,
    isInitialized,
    login,
    signup,
    logout,
    updateUser,
    resetAllAccounts,
    getAllUsers,
    updateUserRole,
    deleteUser,
    defaultAdminEmail: "admin@learnova.com",
    defaultAdminPassword: "admin123",
    loginWithII: ii.login,
    needsIIRegistration,
    clearIIRegistration,
    finishIIRegistration,
  };
}
