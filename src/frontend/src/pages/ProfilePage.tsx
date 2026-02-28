import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Save,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { getXpForLesson } from "../data/lessonContent";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateOrUpdateProfile,
  useGetLessons,
  useGetUserProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: lessons, isLoading: lessonsLoading } = useGetLessons();
  const { mutate: updateProfile, isPending: updating } =
    useCreateOrUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const isAuthenticated = !!identity;

  const completedLessons = profile?.completedLessons ?? [];
  const totalLessons = lessons?.length ?? 0;
  const completedCount = completedLessons.length;
  const progressPercent =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Calculate total possible XP
  const totalPossibleXP = (lessons ?? []).reduce(
    (sum, _, i) => sum + getXpForLesson(i),
    0,
  );
  const earnedXP = Number(profile?.xp ?? 0);

  function handleStartEdit() {
    setNewUsername(profile?.username ?? "");
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setNewUsername("");
  }

  function handleSaveUsername() {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    updateProfile(trimmed, {
      onSuccess: () => {
        toast.success("Username updated!");
        setEditing(false);
        setNewUsername("");
      },
      onError: () => toast.error("Failed to update username"),
    });
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 border border-border mx-auto flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Sign in to view your profile
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Track your progress, XP, and completed lessons.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profileLoading || lessonsLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <p className="text-muted-foreground">
          No profile found. Please set up your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-5 mb-8"
      >
        <Avatar className="w-20 h-20 ring-4 ring-python-yellow/30 shrink-0">
          <AvatarFallback className="bg-primary/10 text-python-yellow text-2xl font-display font-bold">
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <Label
                htmlFor="new-username"
                className="text-sm text-muted-foreground"
              >
                New username
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Your username"
                  className="bg-muted/50 border-border font-mono"
                  maxLength={30}
                  autoFocus
                  disabled={updating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUsername();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSaveUsername}
                  disabled={updating || newUsername.trim().length < 2}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                >
                  {updating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground truncate">
                {profile.username}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="text-muted-foreground hover:text-foreground p-1 h-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs bg-python-yellow/10 text-python-yellow border-python-yellow/30"
            >
              Python Learner
            </Badge>
            {completedCount >= totalLessons && totalLessons > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-xp-gold/10 text-xp-gold border-xp-gold/30"
              >
                🏆 Course Complete
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            icon: Zap,
            label: "Total XP",
            value: earnedXP.toLocaleString(),
            sub: `of ${totalPossibleXP} possible`,
            color: "text-xp-gold",
            bg: "bg-xp-gold/10",
            border: "border-xp-gold/20",
          },
          {
            icon: CheckCircle2,
            label: "Completed",
            value: completedCount.toString(),
            sub: `of ${totalLessons} lessons`,
            color: "text-success",
            bg: "bg-success/10",
            border: "border-success/20",
          },
          {
            icon: Trophy,
            label: "Progress",
            value: `${Math.round(progressPercent)}%`,
            sub: "course complete",
            color: "text-python-blue",
            bg: "bg-python-blue/10",
            border: "border-python-blue/20",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bg} border ${stat.border} rounded-xl p-4 flex flex-col items-center text-center`}
            >
              <Icon className={`w-5 h-5 ${stat.color} mb-1.5`} />
              <div className={`text-xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Progress section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <h2 className="font-display font-semibold text-foreground mb-4">
          Course Progress
        </h2>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalLessons} lessons completed
          </span>
          <span className="text-sm font-mono font-bold text-python-yellow">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-3 bg-muted" />
        {progressPercent === 100 && (
          <p className="text-xs text-success mt-2 font-medium">
            🎉 Congratulations! You've completed all Python lessons!
          </p>
        )}
      </motion.div>

      {/* Completed lessons list */}
      {completedLessons.length > 0 && lessons && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Completed Lessons
          </h2>
          <div className="space-y-2">
            {lessons
              .filter((l) => completedLessons.includes(l.id))
              .map((lesson) => {
                const lessonIndex = lessons.findIndex(
                  (l) => l.id === lesson.id,
                );
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="w-7 h-7 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground flex-1 truncate">
                      {lesson.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-xp-gold/10 text-xp-gold border-transparent shrink-0"
                    >
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      {getXpForLesson(lessonIndex)} XP
                    </Badge>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
