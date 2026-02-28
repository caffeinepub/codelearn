import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Lesson, Exercise, UserProfile } from "../backend.d";

export function useGetLessons() {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson[]>({
    queryKey: ["lessons"],
    queryFn: async () => {
      if (!actor) return [];
      const lessons = await actor.getLessons();
      return [...lessons].sort((a, b) => Number(a.order) - Number(b.order));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLesson(lessonId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson | null>({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLesson(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useGetExercises(lessonId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Exercise[]>({
    queryKey: ["exercises", lessonId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExercises(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      const board = await actor.getLeaderboard();
      return [...board].sort((a, b) => Number(b.totalXP) - Number(a.totalXP));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsLessonCompleted(lessonId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["lessonCompleted", lessonId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isLessonCompleted(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrUpdateProfile(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSubmitLessonProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      score,
    }: {
      lessonId: string;
      score: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitLessonProgress(lessonId, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["lessonCompleted"] });
    },
  });
}
