import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Question = {
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
  };

  public type Lesson = {
    id : Text;
    title : Text;
    description : Text;
    questions : [Question];
  };

  public type UserProfile = {
    username : Text;
    xp : Nat;
    completedLessons : [Text];
  };

  type InternalState = {
    lessons : Map.Map<Text, Lesson>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let lessons = Map.empty<Text, Lesson>();

  let lesson1 : Lesson = {
    id = "1";
    title = "Variables & Data Types";
    description = "Learn about variables and data types in Python";
    questions = [
      {
        questionText = "Which of these is a valid variable name?";
        options = ["123var", "var_123", "var-123"];
        correctAnswerIndex = 1;
      },
      {
        questionText = "What is the correct way to declare a variable in Python?";
        options = ["let x = 10", "x := 10", "x = 10"];
        correctAnswerIndex = 2;
      },
      {
        questionText = "What is the data type of 3.14?";
        options = ["int", "float", "string"];
        correctAnswerIndex = 1;
      },
    ];
  };

  let lesson2 : Lesson = {
    id = "2";
    title = "Control Flow (if/else)";
    description = "Understand conditional statements in Python";
    questions = [
      {
        questionText = "Which keyword is used for conditional statements?";
        options = ["if", "when", "check"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "What is the correct syntax for an if statement?";
        options = ["if x > 5:", "if (x > 5)", "if x > 5 then"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "Which keyword is used for the alternative condition?";
        options = ["otherwise", "else", "alternative"];
        correctAnswerIndex = 1;
      },
    ];
  };

  let lesson3 : Lesson = {
    id = "3";
    title = "Loops (for/while)";
    description = "Master loops in Python";
    questions = [
      {
        questionText = "Which loop is used to iterate over a sequence?";
        options = ["for", "while", "loop"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "What does 'break' do in a loop?";
        options = ["Pauses the loop", "Exits the loop", "Skips one iteration"];
        correctAnswerIndex = 1;
      },
      {
        questionText = "Which statement skips the current iteration?";
        options = ["skip", "continue", "next"];
        correctAnswerIndex = 1;
      },
    ];
  };

  let lesson4 : Lesson = {
    id = "4";
    title = "Functions";
    description = "Learn how to define and use functions";
    questions = [
      {
        questionText = "Which keyword is used to define a function?";
        options = ["function", "def", "func"];
        correctAnswerIndex = 1;
      },
      {
        questionText = "How do you return a value from a function?";
        options = ["return value", "output value", "give value"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "Can a function have multiple parameters?";
        options = ["No", "Yes", "Only two"];
        correctAnswerIndex = 1;
      },
    ];
  };

  let lesson5 : Lesson = {
    id = "5";
    title = "Lists and Dictionaries";
    description = "Work with Python's data structures";
    questions = [
      {
        questionText = "How do you create an empty list?";
        options = ["[]", "{}", "()"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "How do you access the first element of a list?";
        options = ["list[0]", "list[1]", "list.first()"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "How do you create a dictionary?";
        options = ["[]", "{}", "dict()"];
        correctAnswerIndex = 1;
      },
    ];
  };

  let lesson6 : Lesson = {
    id = "6";
    title = "Basic OOP (Classes)";
    description = "Introduction to Object-Oriented Programming";
    questions = [
      {
        questionText = "Which keyword is used to define a class?";
        options = ["class", "object", "type"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "What is the special method called when creating an object?";
        options = ["__init__", "__new__", "__create__"];
        correctAnswerIndex = 0;
      },
      {
        questionText = "What does 'self' refer to in a class method?";
        options = ["The class", "The instance", "The method"];
        correctAnswerIndex = 1;
      },
    ];
  };

  lessons.add("1", lesson1);
  lessons.add("2", lesson2);
  lessons.add("3", lesson3);
  lessons.add("4", lesson4);
  lessons.add("5", lesson5);
  lessons.add("6", lesson6);

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Admin-only: Add or update a lesson
  public shared ({ caller }) func addLesson(lesson : Lesson) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add lessons");
    };
    lessons.add(lesson.id, lesson);
  };

  // Admin-only: Delete a lesson
  public shared ({ caller }) func deleteLesson(lessonId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete lessons");
    };
    lessons.remove(lessonId);
  };

  // User-only: Set or update username
  public shared ({ caller }) func addOrUpdateUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    let existingProfile = userProfiles.get(caller);
    let newProfile = {
      username;
      xp = switch (existingProfile) {
        case (?profile) { profile.xp };
        case (null) { 0 };
      };
      completedLessons = switch (existingProfile) {
        case (?profile) { profile.completedLessons };
        case (null) { [] };
      };
    };

    userProfiles.add(caller, newProfile);
  };

  // User-only: Mark lesson as complete and earn XP
  public shared ({ caller }) func completeLesson(lessonId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete lessons");
    };

    // Verify lesson exists
    switch (lessons.get(lessonId)) {
      case (null) { Runtime.trap("Lesson not found") };
      case (?_) {};
    };

    let existingProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };

    // Check if already completed
    if (existingProfile.completedLessons.any(func(id) { id == lessonId })) {
      return;
    };

    let newXP = existingProfile.xp + 10;
    let newCompletedLessons = existingProfile.completedLessons.concat([lessonId]);

    let updatedProfile = {
      username = existingProfile.username;
      xp = newXP;
      completedLessons = newCompletedLessons;
    };

    userProfiles.add(caller, updatedProfile);
  };

  // User-only: Submit quiz answer and earn XP if correct
  public shared ({ caller }) func submitQuizAnswer(lessonId : Text, questionIndex : Nat, answerIndex : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access quizzes");
    };

    let lesson = switch (lessons.get(lessonId)) {
      case (?l) { l };
      case (null) { Runtime.trap("Lesson not found") };
    };

    if (questionIndex >= lesson.questions.size()) {
      Runtime.trap("Invalid question index");
    };

    let question = lesson.questions[questionIndex];
    let isCorrect = (answerIndex == question.correctAnswerIndex);

    if (isCorrect) {
      let existingProfile = switch (userProfiles.get(caller)) {
        case (?profile) { profile };
        case (null) { Runtime.trap("Profile not found") };
      };

      let newXP = existingProfile.xp + 5;
      let updatedProfile = {
        username = existingProfile.username;
        xp = newXP;
        completedLessons = existingProfile.completedLessons;
      };
      userProfiles.add(caller, updatedProfile);
    };

    isCorrect;
  };

  // Public: Get leaderboard (no auth required)
  public query ({ caller }) func getLeaderboard() : async [(Text, Nat)] {
    let leaderboard = userProfiles.toArray().map(
      func((_, profile)) { (profile.username, profile.xp) }
    );

    func compare(a : (Text, Nat), b : (Text, Nat)) : Order.Order {
      switch (Nat.compare(b.1, a.1)) {
        case (#equal) {
          switch (Text.compare(a.0, b.0)) {
            case (#equal) { #equal };
            case (#less) { #less };
            case (#greater) { #greater };
          };
        };
        case (#less) { #less };
        case (#greater) { #greater };
      };
    };

    leaderboard.sort<(Text, Nat)>();
  };

  // Public: Get all lessons (no auth required)
  public query ({ caller }) func getAllLessons() : async [Lesson] {
    lessons.toArray().map<(Text, Lesson), Lesson>(
      func((id, lesson)) { lesson }
    );
  };

  // Public: Get specific lesson (no auth required)
  public query ({ caller }) func getLesson(id : Text) : async ?Lesson {
    lessons.get(id);
  };

  // User-only: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // User can view own profile, admin can view any profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Required by frontend: Save caller's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
