import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useGetUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["userCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUserCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDoesAdminExist() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["adminExists"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.doesAdminExist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; email: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProfile(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; email: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMyProfile(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserRole(user, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["userCount"] });
    },
  });
}

export function useSeedFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedFirstAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["adminExists"] });
    },
  });
}
