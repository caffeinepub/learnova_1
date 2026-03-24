import { useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type UserProfile, UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveAppRole(profile: UserProfile | null): AppRole {
  if (!profile) return "guest";
  if (profile.role === UserRole.admin) return "admin";
  if (profile.role === UserRole.user) {
    if (profile.avatarUrl?.includes("instructor")) return "instructor";
    return "learner";
  }
  return "guest";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserProfile(identity!.getPrincipal());
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const isLoading =
    actorFetching || (isAuthenticated && profileQuery.isLoading);
  const isFetched = !!actor && profileQuery.isFetched;
  const profile = profileQuery.data ?? null;
  const role = deriveAppRole(profile);

  useEffect(() => {
    if (isAuthenticated && isFetched && profile === null) {
      setShowRegisterModal(true);
    } else {
      setShowRegisterModal(false);
    }
  }, [isAuthenticated, isFetched, profile]);

  const refetchProfile = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["myProfile"] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await clear();
    queryClient.clear();
  }, [clear, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        isAdmin: role === "admin",
        isInstructor: role === "instructor",
        isLearner: role === "learner",
        isAuthenticated,
        isLoading,
        isFetched,
        showRegisterModal,
        setShowRegisterModal,
        refetchProfile,
        logout,
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
