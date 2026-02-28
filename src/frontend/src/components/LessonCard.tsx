import { motion } from "motion/react";
import { Lock, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "../backend.d";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isLocked: boolean;
  index: number;
  onClick: () => void;
}

export function LessonCard({ lesson, isCompleted, isLocked, index, onClick }: LessonCardProps) {
  const topicColors = [
    "border-l-[oklch(0.85_0.22_120)]",
    "border-l-[oklch(0.6_0.18_245)]",
    "border-l-[oklch(0.75_0.18_60)]",
    "border-l-[oklch(0.65_0.2_165)]",
    "border-l-[oklch(0.72_0.18_200)]",
    "border-l-[oklch(0.72_0.18_295)]",
  ];
  const accentColor = topicColors[index % topicColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={!isLocked ? { y: -2, transition: { duration: 0.15 } } : {}}
    >
      <button
        type="button"
        onClick={!isLocked ? onClick : undefined}
        disabled={isLocked}
        className={`
          w-full text-left bg-card border border-border rounded-xl p-5 border-l-4
          transition-all duration-200 group
          ${accentColor}
          ${isLocked
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-border hover:shadow-card hover:bg-card/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          }
        `}
      >
        <div className="flex items-start gap-4">
          {/* Order number */}
          <div className={`
            w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-sm
            ${isCompleted
              ? "bg-success/20 text-success"
              : isLocked
                ? "bg-muted/50 text-muted-foreground"
                : "bg-primary/10 text-python-yellow"
            }
          `}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              String(Number(lesson.order)).padStart(2, "0")
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`
                font-display font-semibold text-base leading-tight
                ${isLocked ? "text-muted-foreground" : "text-foreground group-hover:text-python-yellow transition-colors"}
              `}>
                {lesson.title}
              </h3>
              <ChevronRight className={`
                w-4 h-4 shrink-0 mt-0.5 transition-transform
                ${isLocked ? "text-muted-foreground" : "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-python-yellow"}
              `} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {lesson.description}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`
                  text-xs gap-1 border-transparent
                  ${isCompleted
                    ? "bg-success/10 text-success"
                    : "bg-xp-gold/10 text-xp-gold"
                  }
                `}
              >
                <Zap className="w-3 h-3" />
                {Number(lesson.xpReward)} XP
              </Badge>
              {isCompleted && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-transparent">
                  Completed ✓
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-transparent">
                  Complete previous lesson
                </Badge>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export function LessonCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl p-5 border-l-4 border-l-border"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-5 bg-muted rounded animate-pulse w-16 mt-2" />
        </div>
      </div>
    </motion.div>
  );
}
