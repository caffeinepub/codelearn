import { motion } from "motion/react";
import { Zap, BookOpen, CheckCircle2, Trophy, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LessonCard, LessonCardSkeleton } from "../components/LessonCard";
import { useGetLessons, useGetUserProfile } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Page } from "../App";
import type { Lesson } from "../backend.d";

interface DashboardProps {
  onNavigate: (page: Page, lessonId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { identity, login, isLoggingIn, isInitializing } = useInternetIdentity();
  const { data: lessons, isLoading: lessonsLoading } = useGetLessons();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();

  const isAuthenticated = !!identity;
  const completedLessons = profile?.completedLessons ?? [];
  const totalLessons = lessons?.length ?? 0;
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  function isLessonLocked(lesson: Lesson, index: number): boolean {
    if (index === 0) return false;
    if (!isAuthenticated) return index > 0;
    // Lesson is locked if previous lesson not completed
    const previousLesson = lessons?.[index - 1];
    if (!previousLesson) return false;
    return !completedLessons.includes(previousLesson.id);
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-10 border border-border">
        <img
          src="/assets/generated/python-hero-banner.dim_1200x600.png"
          alt="Python CodeLearn"
          className="w-full h-52 sm:h-64 object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-transparent" />
        <div className="absolute inset-0 flex items-center p-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐍</span>
              <span className="text-xs font-mono bg-python-yellow/20 text-python-yellow border border-python-yellow/30 px-2 py-0.5 rounded-full">
                Python 3.x
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Learn Python<br />
              <span className="text-python-yellow text-glow-yellow">from Scratch</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mb-5">
              Interactive lessons, quizzes, and real code examples to master Python programming.
            </p>

            {!isAuthenticated ? (
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoggingIn ? "Signing in..." : "Start Learning Free"}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-3 py-1.5 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{completedCount}/{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg px-3 py-1.5 border border-border">
                  <Zap className="w-4 h-4 text-xp-gold" />
                  <span className="text-sm font-medium text-xp-gold font-mono">
                    {Number(profile?.totalXP ?? 0).toLocaleString()} XP
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stats strip for logged-in users */}
      {isAuthenticated && profile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            {
              icon: Zap,
              label: "Total XP",
              value: Number(profile.totalXP).toLocaleString(),
              color: "text-xp-gold",
              bg: "bg-xp-gold/10",
            },
            {
              icon: CheckCircle2,
              label: "Completed",
              value: `${completedCount} lessons`,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              icon: Trophy,
              label: "Progress",
              value: `${Math.round(progressPercent)}%`,
              color: "text-python-blue",
              bg: "bg-python-blue/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${stat.bg} border border-border rounded-xl p-4 flex flex-col items-center text-center`}
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-1.5`} />
                <div className={`text-lg font-display font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Progress bar */}
      {isAuthenticated && totalLessons > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Course Progress</span>
            <span className="text-sm text-muted-foreground font-mono">
              {completedCount} / {totalLessons}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-muted" />
        </motion.div>
      )}

      {/* Lessons header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-python-yellow" />
          <h2 className="font-display text-xl font-bold text-foreground">Python Lessons</h2>
        </div>
        {totalLessons > 0 && (
          <span className="text-sm text-muted-foreground font-mono">
            {totalLessons} lessons
          </span>
        )}
      </div>

      {/* Lessons grid */}
      <div className="grid gap-3">
        {lessonsLoading || profileLoading ? (
          Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key, i) => (
            <LessonCardSkeleton key={key} index={i} />
          ))
        ) : lessons && lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedLessons.includes(lesson.id)}
              isLocked={isLessonLocked(lesson, index)}
              index={index}
              onClick={() => onNavigate("lesson", lesson.id)}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-border rounded-xl"
          >
            <div className="text-4xl mb-3">🐍</div>
            <p className="text-muted-foreground text-sm">
              Lessons are being loaded. Please wait...
            </p>
          </motion.div>
        )}
      </div>

      {/* CTA for unauthenticated */}
      {!isAuthenticated && !isInitializing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center p-8 border border-dashed border-python-yellow/30 rounded-xl bg-python-yellow/5"
        >
          <div className="text-3xl mb-3">🔐</div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            Sign in to track your progress
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            Complete lessons, earn XP, and compete on the leaderboard.
          </p>
          <Button
            onClick={login}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in to Start
          </Button>
        </motion.div>
      )}
    </div>
  );
}
