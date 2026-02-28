import { motion } from "motion/react";
import { Trophy, Medal, Zap, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetLeaderboard, useGetUserProfile } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-muted-foreground font-mono text-sm w-5 text-center">#{rank}</span>;
}

function getRankBg(rank: number): string {
  if (rank === 1) return "bg-yellow-400/10 border-yellow-400/30";
  if (rank === 2) return "bg-slate-400/10 border-slate-400/30";
  if (rank === 3) return "bg-amber-600/10 border-amber-600/30";
  return "bg-card border-border";
}

export function LeaderboardPage() {
  const { identity } = useInternetIdentity();
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const { data: profile } = useGetUserProfile();

  const currentUserId = identity?.getPrincipal().toString();

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-xp-gold/20 border-2 border-xp-gold/40 mx-auto mb-4 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-xp-gold" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Top Python learners ranked by XP earned
        </p>
      </motion.div>

      {/* Current user rank */}
      {profile && identity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl border border-python-yellow/30 bg-python-yellow/5"
        >
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">Your rank</div>
            <div className="ml-auto flex items-center gap-2">
              <Zap className="w-4 h-4 text-xp-gold" />
              <span className="font-mono font-bold text-xp-gold">
                {Number(profile.totalXP).toLocaleString()} XP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="w-8 h-8 ring-2 ring-python-yellow/40">
              <AvatarFallback className="bg-python-yellow/20 text-python-yellow text-xs font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{profile.username}</span>
            <Badge className="ml-auto bg-python-yellow/10 text-python-yellow border-python-yellow/30 text-xs">
              {profile.completedLessons.length} lessons
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Leaderboard list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 8 }, (_, i) => `lb-skeleton-${i}`).map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-20" />
            </motion.div>
          ))
        ) : leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.userId.toString() === currentUserId;

            return (
              <motion.div
                key={user.userId.toString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${getRankBg(rank)}
                  ${isCurrentUser ? "ring-2 ring-python-yellow/50 shadow-glow" : ""}
                `}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar */}
                <Avatar className={`w-9 h-9 shrink-0 ${
                  rank === 1 ? "ring-2 ring-yellow-400/50" :
                  rank === 2 ? "ring-2 ring-slate-400/50" :
                  rank === 3 ? "ring-2 ring-amber-600/50" : ""
                }`}>
                  <AvatarFallback className={`text-xs font-bold ${
                    rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                    rank === 2 ? "bg-slate-400/20 text-slate-300" :
                    rank === 3 ? "bg-amber-600/20 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm truncate ${
                      isCurrentUser ? "text-python-yellow" : "text-foreground"
                    }`}>
                      {user.username}
                    </span>
                    {isCurrentUser && (
                      <Badge className="text-[10px] bg-python-yellow/10 text-python-yellow border-python-yellow/30 shrink-0">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.completedLessons.length} lesson{user.completedLessons.length !== 1 ? "s" : ""} completed
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-xp-gold" />
                  <span className="font-mono font-bold text-sm text-xp-gold">
                    {Number(user.totalXP).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-border rounded-xl"
          >
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">
              No one on the leaderboard yet. Be the first! 🐍
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
