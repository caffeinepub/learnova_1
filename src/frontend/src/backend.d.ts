import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ProfileId = bigint;
export interface CreateUserProfileDto {
    name: string;
    email: string;
}
export type Time = bigint;
export interface UpdateUserProfileDto {
    name: string;
    email: string;
}
export interface UserProfile {
    id: ProfileId;
    principal: Principal;
    name: string;
    createdAt: Time;
    role: UserRole;
    email: string;
    avatarUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    doesAdminExist(): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<UserProfile | null>;
    getUserCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    /**
     * / General Queries
     */
    getUsers(): Promise<Array<UserProfile>>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isInstructor(): Promise<boolean>;
    /**
     * / Profile-Specific Queries
     */
    registerProfile(createProfileDto: CreateUserProfileDto): Promise<UserProfile>;
    seedFirstAdmin(): Promise<void>;
    setUserRole(user: Principal, role: UserRole): Promise<void>;
    updateMyProfile(updateProfileDto: UpdateUserProfileDto): Promise<void>;
}
