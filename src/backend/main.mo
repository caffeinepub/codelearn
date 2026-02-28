import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Data Types
  public type Lesson = {
    id : Text;
    title : Text;
    description : Text;
    content : Text;
    codeExample : Text;
    order : Nat;
    xpReward : Nat;
  };

  public type Exercise = {
    id : Text;
    lessonId : Text;
    question : Text;
    options : [Text];
    correctAnswer : Text;
    explanation : Text;
  };

  public type UserProfile = {
    userId : Principal;
    username : Text;
    totalXP : Nat;
    completedLessons : [Text];
  };

  public type LessonProgress = {
    lessonId : Text;
    score : Nat;
    completed : Bool;
  };

  // Lessons
  let lessons = [
    {
      id = "1";
      title = "Introduction to Python";
      description = "Learn the basics of Python programming language.";
      content = "Variables, Data Types, and Basic Operations";
      codeExample = "x = 5\nprint(type(x))";
      order = 1;
      xpReward = 100;
    },
    {
      id = "2";
      title = "Control Flow";
      description = "Master conditional statements and loops.";
      content = "if, else, for, while";
      codeExample = "for i in range(5):\n  print(i)";
      order = 2;
      xpReward = 150;
    },
    {
      id = "3";
      title = "Functions";
      description = "Learn how to write and use functions.";
      content = "def, parameters, return values";
      codeExample = "def greet(name):\n  print('Hello, ' + name)";
      order = 3;
      xpReward = 200;
    },
    {
      id = "4";
      title = "Lists and Dictionaries";
      description = "Explore Python's powerful data structures.";
      content = "Lists, Dictionaries, Methods";
      codeExample = "my_list = [1, 2, 3]\nmy_dict = {'key': 'value'}";
      order = 4;
      xpReward = 180;
    },
    {
      id = "5";
      title = "Object-Oriented Programming";
      description = "Understand classes and objects in Python.";
      content = "Classes, Objects, Methods";
      codeExample = "class Person:\n  def __init__(self, name):\n    self.name = name";
      order = 5;
      xpReward = 220;
    },
  ];

  // Exercises
  let exercises = [
    {
      id = "ex1";
      lessonId = "1";
      question = "What is the correct way to print a variable's type in Python?";
      options = ["print(var.type())", "print(type(var))", "echo(type(var))"];
      correctAnswer = "print(type(var))";
      explanation = "The correct syntax is print(type(var)).";
    },
    {
      id = "ex2";
      lessonId = "1";
      question = "Which of the following is a valid variable declaration in Python?";
      options = ["var x = 10", "int x = 10", "x = 10"];
      correctAnswer = "x = 10";
      explanation = "Python uses dynamic typing, so no type declaration is needed.";
    },
    {
      id = "ex3";
      lessonId = "2";
      question = "Which keyword is used for loops in Python?";
      options = ["repeat", "cycle", "for"];
      correctAnswer = "for";
      explanation = "The 'for' keyword is used for loops in Python.";
    },
    {
      id = "ex4";
      lessonId = "2";
      question = "What is the syntax for an if statement in Python?";
      options = ["if(condition){}", "if condition:", "if (condition):"];
      correctAnswer = "if condition:";
      explanation = "Python uses 'if condition:' for conditional statements.";
    },
    {
      id = "ex5";
      lessonId = "3";
      question = "How do you define a function in Python?";
      options = ["def func():", "function func(){}", "func() => {}"];
      correctAnswer = "def func():";
      explanation = "Functions are defined using the 'def' keyword.";
    },
    {
      id = "ex6";
      lessonId = "3";
      question = "How do you return a value from a Python function?";
      options = ["return value;", "value = return()", "return value"];
      correctAnswer = "return value";
      explanation = "Use the 'return' keyword to return values from functions.";
    },
    {
      id = "ex7";
      lessonId = "4";
      question = "Which method adds an element to a list?";
      options = ["insert()", "add()", "append()"];
      correctAnswer = "append()";
      explanation = "The 'append()' method adds elements to the end of a list.";
    },
    {
      id = "ex8";
      lessonId = "4";
      question = "How do you access a value in a dictionary by key?";
      options = ["dict.key", "dict['key']", "get(dict, 'key')"];
      correctAnswer = "dict['key']";
      explanation = "Use square brackets to access values by key in dictionaries.";
    },
    {
      id = "ex9";
      lessonId = "5";
      question = "How do you define a class in Python?";
      options = ["class MyClass:", "class MyClass {}", "let MyClass = {}"];
      correctAnswer = "class MyClass:";
      explanation = "Classes are defined using the 'class' keyword.";
    },
    {
      id = "ex10";
      lessonId = "5";
      question = "How do you create an object from a class?";
      options = ["MyClass.new()", "instantiate(MyClass)", "MyClass()"];
      correctAnswer = "MyClass()";
      explanation = "Use 'MyClass()' to create a new object instance.";
    },
  ];

  // Profile Storage
  let profiles = Map.empty<Principal, UserProfile>();

  // Leaderboard Sorting
  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Nat.compare(p2.totalXP, p1.totalXP);
    };
  };

  func getProfileInternal(userId : Principal) : ?UserProfile {
    profiles.get(userId);
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Public methods
  public query ({ caller }) func getLessons() : async [Lesson] {
    lessons;
  };

  public query ({ caller }) func getLesson(lessonId : Text) : async ?Lesson {
    lessons.find(func(l) { l.id == lessonId });
  };

  public query ({ caller }) func getExercises(lessonId : Text) : async [Exercise] {
    exercises.filter(func(e) { e.lessonId == lessonId });
  };

  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    getProfileInternal(caller);
  };

  public shared ({ caller }) func createOrUpdateProfile(username : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };

    let existingProfile = getProfileInternal(caller);

    let newProfile = {
      userId = caller;
      username;
      totalXP = switch (existingProfile) {
        case (?profile) { profile.totalXP };
        case (null) { 0 };
      };
      completedLessons = switch (existingProfile) {
        case (?profile) { profile.completedLessons };
        case (null) { [] };
      };
    };

    profiles.add(caller, newProfile);
    newProfile;
  };

  public shared ({ caller }) func submitLessonProgress(lessonId : Text, score : Nat) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit lesson progress");
    };

    let existingProfile = switch (getProfileInternal(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile does not exist") };
    };

    if (existingProfile.completedLessons.any(func(l) { l == lessonId })) {
      return existingProfile; // Already completed
    };

    let updatedLessons = existingProfile.completedLessons.concat([lessonId]);
    let lesson = switch (lessons.find(func(l) { l.id == lessonId })) {
      case (?l) { l };
      case (null) { Runtime.trap("Lesson does not exist") };
    };

    let newXP = existingProfile.totalXP + lesson.xpReward;

    let updatedProfile = {
      userId = caller;
      username = existingProfile.username;
      totalXP = newXP;
      completedLessons = updatedLessons;
    };

    profiles.add(caller, updatedProfile);
    updatedProfile;
  };

  public query ({ caller }) func getLeaderboard() : async [UserProfile] {
    profiles.values().toArray().sort();
  };

  public query ({ caller }) func isLessonCompleted(lessonId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check lesson completion");
    };

    switch (profiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.completedLessons.any(func(l) { l == lessonId });
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfileByPrincipal(user: Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = getProfileInternal(caller);

    let newProfile = {
      userId = caller;
      username;
      totalXP = switch (existingProfile) {
        case (?profile) { profile.totalXP };
        case (null) { 0 };
      };
      completedLessons = switch (existingProfile) {
        case (?profile) { profile.completedLessons };
        case (null) { [] };
      };
    };

    profiles.add(caller, newProfile);
  };
};
