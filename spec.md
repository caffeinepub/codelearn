# CodeLearn

## Current State
No existing project. Starting fresh.

## Requested Changes (Diff)

### Add
- Python programming language learning app
- Structured lessons covering Python fundamentals (variables, data types, control flow, functions, lists/dicts, OOP, etc.)
- Code examples with syntax highlighting in each lesson
- Multiple-choice quizzes after each lesson with instant feedback
- XP/points system: earn XP for completing lessons and quizzes
- User profiles with username, XP total, and completed lessons
- Leaderboard showing top users by XP
- Lesson progress tracking: lessons unlock sequentially as user completes them
- Internet Identity authentication

### Modify
- None

### Remove
- None

## Implementation Plan
1. Select authorization component
2. Generate Motoko backend with:
   - User profile management (username, XP, completedLessons)
   - Lesson data (title, content, code examples, quiz questions)
   - Methods: getProfile, setUsername, completeLesson, submitQuizAnswer, getLeaderboard, getLessons
3. Build React frontend with:
   - Landing/login page
   - Lesson list with lock/unlock indicators
   - Individual lesson pages with code blocks and quizzes
   - Profile page with XP and progress
   - Leaderboard page
   - Navigation between sections
