import type React from "react";
import { createContext, useContext } from "react";
import type { UserProfile } from "../backend.d";
import { useLocalAuth } from "../hooks/useLocalAuth";

export type AppRole = "admin" | "instructor" | "learner" | "guest";

interface AuthContextValue {
  profile: UserProfile | null;
  role: AppRole;
  isAdmin: boolean;
  isInstructor: boolean;
  isLearner: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFetched: boolean;
  showRegisterModal: boolean;
  setShowRegisterModal: (v: boolean) => void;
  refetchProfile: () => void;
  logout: () => void;
  updateLocalUser: (updates: { name?: string; email?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isInitialized, logout, updateUser } = useLocalAuth();

  const isAuthenticated = !!currentUser;

  const profile: UserProfile | null = currentUser
    ? {
        id: BigInt(0),
        principal: { toString: () => currentUser.id } as never,
        name: currentUser.name,
        email: currentUser.email,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        role: "user" as never,
        avatarUrl: "",
      }
    : null;

  const role: AppRole = currentUser
    ? currentUser.role === "admin"
      ? "admin"
      : currentUser.role === "instructor"
        ? "instructor"
        : "learner"
    : "guest";

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        isAdmin: role === "admin",
        isInstructor: role === "instructor",
        isLearner: role === "learner",
        isAuthenticated,
        isLoading: !isInitialized,
        isFetched: isInitialized,
        showRegisterModal: false,
        setShowRegisterModal: () => {},
        refetchProfile: () => {},
        logout,
        updateLocalUser: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
