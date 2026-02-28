import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Zap, BookOpen, Play, CheckCircle2, XCircle,
  Loader2, ChevronRight, Trophy, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGetLesson, useGetExercises, useSubmitLessonProgress } from "../hooks/useQueries";
import { useGetUserProfile } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { CodeBlock } from "../components/CodeBlock";
import { toast } from "sonner";
import type { Exercise } from "../backend.d";

interface LessonPageProps {
  lessonId: string;
  onBack: () => void;
}

type LessonView = "content" | "quiz" | "results";

interface QuizState {
  currentIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  correctCount: number;
  answers: Record<string, { selected: string; correct: boolean }>;
}

export function LessonPage({ lessonId, onBack }: LessonPageProps) {
  const { identity } = useInternetIdentity();
  const { data: lesson, isLoading: lessonLoading } = useGetLesson(lessonId);
  const { data: exercises, isLoading: exercisesLoading } = useGetExercises(lessonId);
  const { data: profile } = useGetUserProfile();
  const { mutate: submitProgress, isPending: submitting } = useSubmitLessonProgress();
  const [view, setView] = useState<LessonView>("content");
  const [xpFloating, setXpFloating] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const [quiz, setQuiz] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswer: null,
    isAnswered: false,
    correctCount: 0,
    answers: {},
  });

  const isCompleted = profile?.completedLessons.includes(lessonId) ?? false;
  const currentExercise: Exercise | undefined = exercises?.[quiz.currentIndex];
  const totalExercises = exercises?.length ?? 0;

  function handleStartQuiz() {
    setQuiz({
      currentIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      correctCount: 0,
      answers: {},
    });
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectAnswer(option: string) {
    if (quiz.isAnswered || !currentExercise) return;
    const isCorrect = option === currentExercise.correctAnswer;
    setQuiz((prev) => ({
      ...prev,
      selectedAnswer: option,
      isAnswered: true,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      answers: {
        ...prev.answers,
        [currentExercise.id]: { selected: option, correct: isCorrect },
      },
    }));
  }

  function handleNextQuestion() {
    if (!exercises) return;
    const nextIndex = quiz.currentIndex + 1;
    if (nextIndex >= exercises.length) {
      // Quiz complete
      const score = quiz.correctCount + (quiz.answers[currentExercise?.id ?? ""]?.correct ? 0 : 0);
      const finalCorrect = quiz.answers[currentExercise?.id ?? ""]?.correct
        ? quiz.correctCount
        : quiz.correctCount;
      // Actually recalculate from answers including current
      const totalCorrect = Object.values({
        ...quiz.answers,
        ...(currentExercise ? {
          [currentExercise.id]: {
            selected: quiz.selectedAnswer ?? "",
            correct: quiz.selectedAnswer === currentExercise.correctAnswer
          }
        } : {})
      }).filter((a) => a.correct).length;

      const xpEarned = lesson ? Math.round((totalCorrect / exercises.length) * Number(lesson.xpReward)) : 0;
      setEarnedXP(xpEarned);

      if (identity) {
        submitProgress(
          { lessonId, score: BigInt(totalCorrect) },
          {
            onSuccess: () => {
              toast.success(`Lesson complete! +${xpEarned} XP earned 🎉`);
              setXpFloating(true);
              setTimeout(() => setXpFloating(false), 1400);
            },
            onError: () => toast.error("Failed to save progress"),
          }
        );
      }
      setView("results");
    } else {
      setQuiz((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        selectedAnswer: null,
        isAnswered: false,
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (lessonLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to lessons
        </Button>
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container max-w-3xl py-8 text-center">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }

  // ── RESULTS VIEW ──────────────────────────────────────────────
  if (view === "results") {
    const totalAnswers = Object.values(quiz.answers).length;
    const correctAnswers = Object.values(quiz.answers).filter((a) => a.correct).length;
    const percent = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const isPerfect = percent === 100;

    return (
      <div className="container max-w-2xl py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          {/* Trophy animation */}
          <motion.div
            className="w-24 h-24 rounded-full bg-xp-gold/20 border-2 border-xp-gold/50 mx-auto mb-6 flex items-center justify-center text-5xl"
            animate={isPerfect ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.6, repeat: isPerfect ? 2 : 0 }}
          >
            {isPerfect ? "🏆" : percent >= 60 ? "⭐" : "📖"}
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            {isPerfect ? "Perfect Score!" : percent >= 60 ? "Well Done!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground mb-8">
            You answered {correctAnswers} of {totalAnswers} questions correctly
          </p>

          {/* Score circle */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 text-center min-w-[120px]">
              <div className="text-4xl font-display font-bold text-python-yellow">{percent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Score</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-center min-w-[120px] relative overflow-hidden">
              <div className="text-4xl font-display font-bold text-xp-gold">+{earnedXP}</div>
              <div className="text-xs text-muted-foreground mt-1">XP Earned</div>
              {/* Floating XP animation */}
              <AnimatePresence>
                {xpFloating && (
                  <motion.div
                    key="xp-float"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-xp-gold pointer-events-none"
                  >
                    +{earnedXP} ⚡
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Answer review */}
          {exercises && exercises.length > 0 && (
            <div className="text-left mb-8 space-y-3">
              <h3 className="font-display font-semibold text-foreground mb-3">Review</h3>
              {exercises.map((ex, i) => {
                const answer = quiz.answers[ex.id];
                if (!answer) return null;
                return (
                  <div
                    key={ex.id}
                    className={`p-4 rounded-xl border ${answer.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {answer.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        Q{i + 1}: {ex.question}
                      </span>
                    </div>
                    {!answer.correct && (
                      <div className="ml-6 text-xs text-muted-foreground space-y-1">
                        <div><span className="text-destructive">Your answer:</span> {answer.selected}</div>
                        <div><span className="text-success">Correct:</span> {ex.correctAnswer}</div>
                        <div className="text-muted-foreground italic">{ex.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2 border-border"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </Button>
            {!isPerfect && (
              <Button
                onClick={handleStartQuiz}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Quiz
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ VIEW ────────────────────────────────────────────────
  if (view === "quiz") {
    if (exercisesLoading || !currentExercise) {
      return (
        <div className="container max-w-2xl py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-python-yellow" />
        </div>
      );
    }

    const progress = ((quiz.currentIndex + (quiz.isAnswered ? 1 : 0)) / totalExercises) * 100;

    return (
      <div className="container max-w-2xl py-8">
        {/* Quiz header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setView("content")}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lesson
          </Button>
          <span className="text-sm text-muted-foreground font-mono">
            Question {quiz.currentIndex + 1} / {totalExercises}
          </span>
        </div>

        <Progress value={progress} className="h-1.5 bg-muted mb-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={quiz.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Question */}
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 leading-relaxed">
              {currentExercise.question}
            </h2>

            {/* Options */}
            <div className="grid gap-3 mb-6">
              {currentExercise.options.map((option) => {
                const isSelected = quiz.selectedAnswer === option;
                const isCorrect = option === currentExercise.correctAnswer;
                const isWrong = quiz.isAnswered && isSelected && !isCorrect;
                const isRevealedCorrect = quiz.isAnswered && isCorrect;

                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleSelectAnswer(option)}
                    disabled={quiz.isAnswered}
                    whileHover={!quiz.isAnswered ? { scale: 1.01 } : {}}
                    whileTap={!quiz.isAnswered ? { scale: 0.99 } : {}}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${isRevealedCorrect
                        ? "border-success bg-success/10 text-foreground"
                        : isWrong
                          ? "border-destructive bg-destructive/10 text-foreground"
                          : isSelected
                            ? "border-python-yellow bg-primary/10 text-foreground"
                            : quiz.isAnswered
                              ? "border-border bg-muted/20 text-muted-foreground cursor-not-allowed"
                              : "border-border bg-card hover:border-python-yellow/60 hover:bg-primary/5 text-foreground cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                        ${isRevealedCorrect
                          ? "border-success bg-success text-background"
                          : isWrong
                            ? "border-destructive bg-destructive text-background"
                            : isSelected
                              ? "border-python-yellow bg-python-yellow text-background"
                              : "border-border text-muted-foreground"
                        }
                      `}>
                        {isRevealedCorrect ? "✓" : isWrong ? "✗" : ""}
                      </div>
                      {option}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation feedback */}
            <AnimatePresence>
              {quiz.isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`
                    rounded-xl p-4 mb-6 border
                    ${quiz.selectedAnswer === currentExercise.correctAnswer
                      ? "bg-success/10 border-success/30"
                      : "bg-destructive/10 border-destructive/30"
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    {quiz.selectedAnswer === currentExercise.correctAnswer ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold mb-1 ${
                        quiz.selectedAnswer === currentExercise.correctAnswer ? "text-success" : "text-destructive"
                      }`}>
                        {quiz.selectedAnswer === currentExercise.correctAnswer ? "Correct! 🎉" : "Not quite!"}
                      </p>
                      <p className="text-sm text-muted-foreground">{currentExercise.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {quiz.isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : quiz.currentIndex + 1 < totalExercises ? (
                    <>Next Question <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>Finish Quiz <Trophy className="w-4 h-4" /></>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── LESSON CONTENT VIEW ───────────────────────────────────────


  return (
    <div className="container max-w-3xl py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to lessons
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs border-python-yellow/40 text-python-yellow bg-python-yellow/10">
            Lesson {String(Number(lesson.order)).padStart(2, "0")}
          </Badge>
          {isCompleted && (
            <Badge variant="outline" className="text-xs border-success/40 text-success bg-success/10">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
            </Badge>
          )}
          <Badge variant="outline" className="text-xs border-border bg-xp-gold/10 text-xp-gold">
            <Zap className="w-3 h-3 mr-1" />
            {Number(lesson.xpReward)} XP
          </Badge>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
          {lesson.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {lesson.description}
        </p>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="prose prose-sm max-w-none mb-8"
      >
        {lesson.content.split("\n\n").map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="text-foreground/90 leading-relaxed mb-4 text-base"
          >
            {paragraph}
          </p>
        ))}
      </motion.div>

      {/* Code example */}
      {lesson.codeExample && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-python-yellow" />
            <h3 className="font-display font-semibold text-foreground">Code Example</h3>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-card">
            {/* Terminal header */}
            <div className="bg-sidebar flex items-center gap-2 px-4 py-2.5 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-xp-gold/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">example.py</span>
            </div>
            <CodeBlock code={lesson.codeExample} />
          </div>
        </motion.div>
      )}

      {/* Quiz CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground mb-1">
              Ready to test your knowledge?
            </h3>
            <p className="text-sm text-muted-foreground">
              {exercisesLoading
                ? "Loading exercises..."
                : `${exercises?.length ?? 0} multiple-choice questions · Earn up to ${Number(lesson.xpReward)} XP`
              }
            </p>
          </div>
          <Button
            onClick={handleStartQuiz}
            disabled={exercisesLoading || !exercises?.length}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 whitespace-nowrap"
          >
            {exercisesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
