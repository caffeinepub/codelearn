import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lesson, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetLessons() {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson[]>({
    queryKey: ["lessons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLessons();
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

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addOrUpdateUserProfile(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useCompleteLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeLesson(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useSubmitQuizAnswer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      lessonId,
      questionIndex,
      answerIndex,
    }: {
      lessonId: string;
      questionIndex: bigint;
      answerIndex: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitQuizAnswer(lessonId, questionIndex, answerIndex);
    },
  });
}
