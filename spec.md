# CodeLearn - Programming Language Learning App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Programming language learning app with multiple languages (Python, JavaScript, TypeScript, Rust, Motoko)
- Lesson system: structured lessons per language with title, description, content, and code examples
- Quiz/exercise system: multiple-choice and fill-in-the-blank questions per lesson
- Progress tracking: track which lessons a user has completed and their quiz scores
- User profile: display username, total XP, completed lessons count, and streak
- Language selection screen: pick a language to learn
- Lesson detail view: display lesson content, code examples, and embedded exercises
- Leaderboard: top users by XP

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend:
   - Data models: Language, Lesson, Exercise, UserProfile, LessonProgress
   - Store: languages with lessons, exercises per lesson
   - APIs: getLanguages, getLessons(languageId), getLesson(id), getExercises(lessonId), getUserProfile(userId), updateProgress(userId, lessonId, score), getLeaderboard
   - Seed with 3 languages (Python, JavaScript, Rust), each with 3 lessons and exercises

2. Frontend:
   - Home/language selection screen
   - Lesson list per language with progress indicators
   - Lesson detail with content and code block
   - Interactive exercise/quiz component
   - User profile/stats panel
   - Leaderboard view
   - Navigation between views
