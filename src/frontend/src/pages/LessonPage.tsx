import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Question } from "../backend.d";
import { CodeBlock } from "../components/CodeBlock";
import { getLessonContent, getXpForLesson } from "../data/lessonContent";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCompleteLesson,
  useGetLesson,
  useGetLessons,
  useGetUserProfile,
  useSubmitQuizAnswer,
} from "../hooks/useQueries";

interface LessonPageProps {
  lessonId: string;
  onBack: () => void;
}

type LessonView = "content" | "quiz" | "results";

interface QuizState {
  currentIndex: number;
  selectedAnswerIndex: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  answers: Array<{
    questionIndex: number;
    answerIndex: number;
    correct: boolean;
  }>;
}

export function LessonPage({ lessonId, onBack }: LessonPageProps) {
  const { identity } = useInternetIdentity();
  const { data: lesson, isLoading: lessonLoading } = useGetLesson(lessonId);
  const { data: allLessons } = useGetLessons();
  const { data: profile } = useGetUserProfile();
  const { mutate: completeLesson, isPending: completing } = useCompleteLesson();
  const { mutateAsync: submitAnswer } = useSubmitQuizAnswer();

  const [view, setView] = useState<LessonView>("content");
  const [xpFloating, setXpFloating] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const [quiz, setQuiz] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswerIndex: null,
    isAnswered: false,
    isCorrect: null,
    answers: [],
  });

  const isCompleted = profile?.completedLessons.includes(lessonId) ?? false;

  // Get lesson index for XP calculation
  const lessonIndex = allLessons?.findIndex((l) => l.id === lessonId) ?? 0;
  const xpReward = getXpForLesson(lessonIndex);
  const content = lesson ? getLessonContent(lesson.title) : null;

  const questions: Question[] = lesson?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion: Question | undefined = questions[quiz.currentIndex];

  function handleStartQuiz() {
    setQuiz({
      currentIndex: 0,
      selectedAnswerIndex: null,
      isAnswered: false,
      isCorrect: null,
      answers: [],
    });
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSelectAnswer(optionIndex: number) {
    if (quiz.isAnswered || !currentQuestion || submittingAnswer) return;

    setSubmittingAnswer(true);

    let correct = false;
    if (identity) {
      try {
        correct = await submitAnswer({
          lessonId,
          questionIndex: BigInt(quiz.currentIndex),
          answerIndex: BigInt(optionIndex),
        });
      } catch {
        // Fallback: check locally
        correct = BigInt(optionIndex) === currentQuestion.correctAnswerIndex;
      }
    } else {
      correct = BigInt(optionIndex) === currentQuestion.correctAnswerIndex;
    }

    setQuiz((prev) => ({
      ...prev,
      selectedAnswerIndex: optionIndex,
      isAnswered: true,
      isCorrect: correct,
      answers: [
        ...prev.answers,
        { questionIndex: prev.currentIndex, answerIndex: optionIndex, correct },
      ],
    }));

    setSubmittingAnswer(false);
  }

  function handleNextQuestion() {
    const nextIndex = quiz.currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      // Quiz complete
      const correctCount = [...quiz.answers].filter((a) => a.correct).length;
      const xpEarned =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * xpReward)
          : 0;
      setEarnedXP(xpEarned);
      setXpFloating(true);
      setTimeout(() => setXpFloating(false), 1400);
      setView("results");
    } else {
      setQuiz((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        selectedAnswerIndex: null,
        isAnswered: false,
        isCorrect: null,
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleMarkComplete() {
    if (!identity) {
      toast.error("Sign in to track progress");
      return;
    }
    completeLesson(lessonId, {
      onSuccess: () => {
        toast.success("Lesson complete! 🎉");
        setXpFloating(true);
        setTimeout(() => setXpFloating(false), 1400);
      },
      onError: () => toast.error("Failed to mark lesson complete"),
    });
  }

  if (lessonLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 gap-2 text-muted-foreground"
        >
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
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  // ── RESULTS VIEW ──────────────────────────────────────────────
  if (view === "results") {
    const correctCount = quiz.answers.filter((a) => a.correct).length;
    const totalAnswered = quiz.answers.length;
    const percent =
      totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
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
            animate={
              isPerfect ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}
            }
            transition={{ duration: 0.6, repeat: isPerfect ? 2 : 0 }}
          >
            {isPerfect ? "🏆" : percent >= 60 ? "⭐" : "📖"}
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            {isPerfect
              ? "Perfect Score!"
              : percent >= 60
                ? "Well Done!"
                : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground mb-8">
            You answered {correctCount} of {totalAnswered} questions correctly
          </p>

          {/* Score cards */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 text-center min-w-[120px]">
              <div className="text-4xl font-display font-bold text-python-yellow">
                {percent}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Score</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-center min-w-[120px] relative overflow-hidden">
              <div className="text-4xl font-display font-bold text-xp-gold">
                +{earnedXP}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                XP Earned
              </div>
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
          {questions.length > 0 && quiz.answers.length > 0 && (
            <div className="text-left mb-8 space-y-3">
              <h3 className="font-display font-semibold text-foreground mb-3">
                Review
              </h3>
              {quiz.answers.map((answer, i) => {
                const q = questions[answer.questionIndex];
                if (!q) return null;
                const correctOption = q.options[Number(q.correctAnswerIndex)];
                const selectedOption = q.options[answer.answerIndex];
                return (
                  <div
                    key={`q-${answer.questionIndex}`}
                    className={`p-4 rounded-xl border ${answer.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {answer.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        Q{i + 1}: {q.questionText}
                      </span>
                    </div>
                    {!answer.correct && (
                      <div className="ml-6 text-xs text-muted-foreground space-y-1">
                        <div>
                          <span className="text-destructive">Your answer:</span>{" "}
                          {selectedOption}
                        </div>
                        <div>
                          <span className="text-success">Correct:</span>{" "}
                          {correctOption}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mark as complete if not done yet */}
          {!isCompleted && identity && (
            <div className="mb-6 p-4 rounded-xl border border-python-yellow/30 bg-python-yellow/5 text-left">
              <p className="text-sm text-foreground mb-3 font-medium">
                Ready to mark this lesson as complete?
              </p>
              <Button
                onClick={handleMarkComplete}
                disabled={completing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {completing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {completing ? "Saving..." : "Mark as Complete"}
              </Button>
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
            <Button
              onClick={handleStartQuiz}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ VIEW ────────────────────────────────────────────────
  if (view === "quiz") {
    if (!currentQuestion) {
      return (
        <div className="container max-w-2xl py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-python-yellow" />
        </div>
      );
    }

    if (totalQuestions === 0) {
      return (
        <div className="container max-w-2xl py-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">
            No quiz questions for this lesson yet.
          </p>
          <Button
            variant="ghost"
            onClick={() => setView("content")}
            className="mt-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lesson
          </Button>
        </div>
      );
    }

    const progress =
      ((quiz.currentIndex + (quiz.isAnswered ? 1 : 0)) / totalQuestions) * 100;

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
            Question {quiz.currentIndex + 1} / {totalQuestions}
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
              {currentQuestion.questionText}
            </h2>

            {/* Options */}
            <div className="grid gap-3 mb-6">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = quiz.selectedAnswerIndex === optionIndex;
                const isCorrectOption =
                  BigInt(optionIndex) === currentQuestion.correctAnswerIndex;
                const isWrong =
                  quiz.isAnswered && isSelected && !isCorrectOption;
                const isRevealedCorrect = quiz.isAnswered && isCorrectOption;

                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleSelectAnswer(optionIndex)}
                    disabled={quiz.isAnswered || submittingAnswer}
                    whileHover={
                      !quiz.isAnswered && !submittingAnswer
                        ? { scale: 1.01 }
                        : {}
                    }
                    whileTap={
                      !quiz.isAnswered && !submittingAnswer
                        ? { scale: 0.99 }
                        : {}
                    }
                    className={`
                      w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${
                        isRevealedCorrect
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
                      <div
                        className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                        ${
                          isRevealedCorrect
                            ? "border-success bg-success text-background"
                            : isWrong
                              ? "border-destructive bg-destructive text-background"
                              : isSelected
                                ? "border-python-yellow bg-python-yellow text-background"
                                : "border-border text-muted-foreground"
                        }
                      `}
                      >
                        {isRevealedCorrect
                          ? "✓"
                          : isWrong
                            ? "✗"
                            : String.fromCharCode(65 + optionIndex)}
                      </div>
                      {option}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Submitting indicator */}
            {submittingAnswer && (
              <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking answer...
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {quiz.isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`
                    rounded-xl p-4 mb-6 border
                    ${
                      quiz.isCorrect
                        ? "bg-success/10 border-success/30"
                        : "bg-destructive/10 border-destructive/30"
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    {quiz.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <p
                      className={`text-sm font-semibold ${quiz.isCorrect ? "text-success" : "text-destructive"}`}
                    >
                      {quiz.isCorrect
                        ? "Correct! 🎉"
                        : `Not quite — the correct answer is: ${currentQuestion.options[Number(currentQuestion.correctAnswerIndex)]}`}
                    </p>
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11"
                >
                  {quiz.currentIndex + 1 < totalQuestions ? (
                    <>
                      Next Question <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz <Trophy className="w-4 h-4" />
                    </>
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
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs border-python-yellow/40 text-python-yellow bg-python-yellow/10"
          >
            Lesson {String(lessonIndex + 1).padStart(2, "0")}
          </Badge>
          {isCompleted && (
            <Badge
              variant="outline"
              className="text-xs border-success/40 text-success bg-success/10"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-xs border-border bg-xp-gold/10 text-xp-gold"
          >
            <Zap className="w-3 h-3 mr-1" />
            {xpReward} XP
          </Badge>
          {content && (
            <Badge
              variant="outline"
              className="text-xs border-python-blue/40 text-python-blue bg-python-blue/10"
            >
              {content.topicTag}
            </Badge>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
          {lesson.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {lesson.description}
        </p>
      </motion.div>

      {/* Code example */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-python-yellow" />
            <h3 className="font-display font-semibold text-foreground">
              Code Example
            </h3>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-card">
            {/* Terminal header */}
            <div className="bg-sidebar flex items-center gap-2 px-4 py-2.5 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-xp-gold/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">
                example.py
              </span>
            </div>
            <CodeBlock code={content.codeExample} />
          </div>
        </motion.div>
      )}

      {/* Quiz CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground mb-1">
              Ready to test your knowledge?
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalQuestions > 0
                ? `${totalQuestions} multiple-choice question${totalQuestions !== 1 ? "s" : ""} · Earn up to ${xpReward} XP`
                : "No quiz available for this lesson yet"}
            </p>
          </div>
          <Button
            onClick={handleStartQuiz}
            disabled={totalQuestions === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </div>
      </motion.div>

      {/* Mark as complete (if authenticated and not complete) */}
      {identity && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <Button
            onClick={handleMarkComplete}
            disabled={completing}
            variant="outline"
            className="w-full gap-2 border-success/40 text-success hover:bg-success/10 hover:border-success h-11"
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {completing ? "Saving..." : "Mark as Complete"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
