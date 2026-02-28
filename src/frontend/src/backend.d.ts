import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Question {
    questionText: string;
    correctAnswerIndex: bigint;
    options: Array<string>;
}
export interface Lesson {
    id: string;
    title: string;
    description: string;
    questions: Array<Question>;
}
export interface UserProfile {
    xp: bigint;
    username: string;
    completedLessons: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLesson(lesson: Lesson): Promise<void>;
    addOrUpdateUserProfile(username: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeLesson(lessonId: string): Promise<void>;
    deleteLesson(lessonId: string): Promise<void>;
    getAllLessons(): Promise<Array<Lesson>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<[string, bigint]>>;
    getLesson(id: string): Promise<Lesson | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuizAnswer(lessonId: string, questionIndex: bigint, answerIndex: bigint): Promise<boolean>;
}
