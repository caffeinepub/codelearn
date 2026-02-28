import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOrUpdateProfile } from "../hooks/useQueries";
import { toast } from "sonner";

export function ProfileSetupModal() {
  const [username, setUsername] = useState("");
  const { mutate, isPending } = useCreateOrUpdateProfile();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    mutate(trimmed, {
      onSuccess: () => {
        toast.success(`Welcome, ${trimmed}! Let's start learning Python! 🐍`);
      },
      onError: () => {
        toast.error("Failed to create profile. Please try again.");
      },
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "oklch(0 0 0 / 0.7)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-card"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-python-yellow mx-auto mb-4 flex items-center justify-center glow-yellow"
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Code2 className="w-8 h-8 text-background" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Welcome to <span className="text-python-yellow">CodeLearn</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Choose a username to track your progress and appear on the leaderboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                Your Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. PythonNinja42"
                className="bg-muted/50 border-border focus:border-python-yellow focus:ring-python-yellow/20 font-mono"
                maxLength={30}
                autoFocus
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                This will be visible on the leaderboard
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || username.trim().length < 2}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-11"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Learning Python
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
