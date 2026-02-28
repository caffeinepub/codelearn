import { motion } from "motion/react";
import { BookOpen, Trophy, User, Code2, LogIn, LogOut, Loader2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile } from "../hooks/useQueries";
import type { Page } from "../App";
import { useState } from "react";

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navLinks = [
  { id: "dashboard" as Page, label: "Learn", icon: BookOpen },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy },
];

export function NavBar({ currentPage, onNavigate }: NavBarProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-sidebar backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <motion.button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 font-display font-bold text-xl group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-md bg-python-yellow flex items-center justify-center glow-yellow">
            <Code2 className="w-4 h-4 text-background" />
          </div>
          <span className="text-foreground">
            Code<span className="text-python-yellow">Learn</span>
          </span>
          <Badge variant="outline" className="text-[10px] border-python-blue text-python-blue hidden sm:inline-flex">
            Python
          </Badge>
        </motion.button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
              onClick={() => onNavigate(link.id)}
                  type="button"
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${isActive
                    ? "bg-primary/10 text-python-yellow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth + XP */}
        <div className="flex items-center gap-3">
          {isAuthenticated && profile && (
            <motion.div
              className="hidden sm:flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1 border border-border"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-xp-gold text-xs font-mono font-bold">⚡</span>
              <span className="text-sm font-semibold text-xp-gold font-mono">
                {Number(profile.totalXP).toLocaleString()} XP
              </span>
            </motion.div>
          )}

          {isAuthenticated && profile && (
            <Avatar className="w-8 h-8 ring-2 ring-python-yellow/30">
              <AvatarFallback className="bg-primary/10 text-python-yellow text-xs font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="hidden sm:flex border-border hover:border-destructive hover:text-destructive gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            >
              {isLoggingIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </span>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-sidebar px-4 pb-4"
        >
          <div className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left
                    ${isActive
                      ? "bg-primary/10 text-python-yellow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => { clear(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            )}
          </div>
          {profile && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
              <User className="w-4 h-4 text-python-yellow" />
              <span className="text-sm text-foreground font-medium">{profile.username}</span>
              <span className="ml-auto text-xp-gold font-mono text-xs font-bold">⚡ {Number(profile.totalXP)} XP</span>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
