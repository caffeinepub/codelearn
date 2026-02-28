import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { NavBar } from "./components/NavBar";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetUserProfile } from "./hooks/useQueries";
import { Dashboard } from "./pages/Dashboard";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LessonPage } from "./pages/LessonPage";
import { ProfilePage } from "./pages/ProfilePage";

export type Page = "dashboard" | "lesson" | "leaderboard" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();

  const showProfileSetup =
    !isInitializing && !profileLoading && !!identity && profile === null;

  function navigateTo(page: Page, lessonId?: string) {
    setCurrentPage(page);
    if (lessonId) setActiveLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" richColors />

      <NavBar currentPage={currentPage} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentPage === "dashboard" && <Dashboard onNavigate={navigateTo} />}
        {currentPage === "lesson" && activeLessonId && (
          <LessonPage
            lessonId={activeLessonId}
            onBack={() => navigateTo("dashboard")}
          />
        )}
        {currentPage === "leaderboard" && <LeaderboardPage />}
        {currentPage === "profile" && <ProfilePage />}
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="container text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-python-yellow hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
