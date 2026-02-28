import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    id: string;
    lessonId: string;
    question: string;
    explanation: string;
    correctAnswer: string;
    options: Array<string>;
}
export interface Lesson {
    id: string;
    title: string;
    content: string;
    order: bigint;
    xpReward: bigint;
    description: string;
    codeExample: string;
}
export interface UserProfile {
    username: string;
    userId: Principal;
    totalXP: bigint;
    completedLessons: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(username: string): Promise<UserProfile>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExercises(lessonId: string): Promise<Array<Exercise>>;
    getLeaderboard(): Promise<Array<UserProfile>>;
    getLesson(lessonId: string): Promise<Lesson | null>;
    getLessons(): Promise<Array<Lesson>>;
    getUserProfile(): Promise<UserProfile | null>;
    getUserProfileByPrincipal(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isLessonCompleted(lessonId: string): Promise<boolean>;
    saveCallerUserProfile(username: string): Promise<void>;
    submitLessonProgress(lessonId: string, score: bigint): Promise<UserProfile>;
}
