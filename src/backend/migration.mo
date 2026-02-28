import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldQuestion = {
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
  };

  type OldLesson = {
    id : Text;
    title : Text;
    description : Text;
    content : Text;
    codeExample : Text;
    order : Nat;
    xpReward : Nat;
  };

  type OldExercise = {
    id : Text;
    lessonId : Text;
    question : Text;
    options : [Text];
    correctAnswer : Text;
    explanation : Text;
  };

  type OldUserProfile = {
    userId : Principal;
    username : Text;
    totalXP : Nat;
    completedLessons : [Text];
  };

  type OldActor = {
    lessons : [OldLesson];
    exercises : [OldExercise];
    profiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewQuestion = {
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
  };

  type NewLesson = {
    id : Text;
    title : Text;
    description : Text;
    questions : [NewQuestion];
  };

  type NewUserProfile = {
    username : Text;
    xp : Nat;
    completedLessons : [Text];
  };

  type NewActor = {
    lessons : Map.Map<Text, NewLesson>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let lessons = Map.empty<Text, NewLesson>();

    let lesson1 : NewLesson = {
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

    let lesson2 : NewLesson = {
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

    let lesson3 : NewLesson = {
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

    let lesson4 : NewLesson = {
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

    let lesson5 : NewLesson = {
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

    let lesson6 : NewLesson = {
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

    { lessons; userProfiles = Map.empty<Principal, NewUserProfile>() };
  };
};
