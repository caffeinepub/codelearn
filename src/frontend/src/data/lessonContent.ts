/**
 * Hardcoded lesson code examples and descriptions keyed by lesson topic keywords.
 * Used to enrich lessons fetched from the backend with frontend-only content.
 */

export interface LessonContent {
  codeExample: string;
  topicTag: string;
  xpReward: number;
}

/** Match a lesson title to a known topic */
export function getLessonContent(title: string): LessonContent {
  const t = title.toLowerCase();

  if (t.includes("variable") || t.includes("data type")) {
    return {
      topicTag: "Variables",
      xpReward: 50,
      codeExample: `# Variables and Data Types in Python

name = "Alice"           # str — text
age = 25                 # int — whole number
height = 1.72            # float — decimal
is_learning = True       # bool — True or False

# Print the type of a variable
print(type(name))        # <class 'str'>
print(type(age))         # <class 'int'>

# String formatting with f-strings
greeting = f"Hello, {name}! You are {age} years old."
print(greeting)

# Multiple assignment
x = y = z = 0
a, b, c = 1, 2, 3

print(f"x={x}, a={a}, b={b}, c={c}")`,
    };
  }

  if (
    t.includes("control") ||
    t.includes("flow") ||
    t.includes("condition") ||
    t.includes("if")
  ) {
    return {
      topicTag: "Control Flow",
      xpReward: 60,
      codeExample: `# Control Flow: if / elif / else

score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Score: {score} → Grade: {grade}")

# Combining conditions
age = 20
has_id = True

if age >= 18 and has_id:
    print("Access granted ✓")
else:
    print("Access denied ✗")

# Ternary (one-line if)
status = "adult" if age >= 18 else "minor"
print(f"Status: {status}")`,
    };
  }

  if (
    t.includes("loop") ||
    t.includes("for") ||
    t.includes("while") ||
    t.includes("iteration")
  ) {
    return {
      topicTag: "Loops",
      xpReward: 70,
      codeExample: `# Loops in Python

# for loop with range
print("Counting up:")
for i in range(5):
    print(f"  {i}")        # 0, 1, 2, 3, 4

# for loop with a list
languages = ["Python", "JavaScript", "Rust"]
for lang in languages:
    print(f"  → {lang}")

# enumerate — get index and value
for index, lang in enumerate(languages):
    print(f"  {index}: {lang}")

# while loop
count = 0
while count < 3:
    print(f"  Loop #{count + 1}")
    count += 1

# Loop control: break and continue
for n in range(10):
    if n == 3:
        continue     # skip 3
    if n == 6:
        break        # stop at 6
    print(n, end=" ")`,
    };
  }

  if (t.includes("function") || t.includes("def") || t.includes("method")) {
    return {
      topicTag: "Functions",
      xpReward: 75,
      codeExample: `# Functions in Python

# Basic function definition
def greet(name):
    """Return a greeting string."""
    return f"Hello, {name}!"

message = greet("Alice")
print(message)            # Hello, Alice!

# Default parameters
def power(base, exponent=2):
    return base ** exponent

print(power(3))           # 9  (uses default exponent)
print(power(2, 10))       # 1024

# Multiple return values
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 7, 2, 9])
print(f"Min: {low}, Max: {high}")

# *args — variable positional arguments
def total(*args):
    return sum(args)

print(total(1, 2, 3, 4))  # 10

# Lambda (anonymous function)
square = lambda x: x ** 2
print(square(5))          # 25`,
    };
  }

  if (
    t.includes("list") ||
    t.includes("dict") ||
    t.includes("tuple") ||
    t.includes("set") ||
    t.includes("collection")
  ) {
    return {
      topicTag: "Collections",
      xpReward: 80,
      codeExample: `# Lists and Dictionaries

# ── Lists ──────────────────────────────
fruits = ["apple", "banana", "cherry"]
print(fruits[0])          # apple
print(fruits[-1])         # cherry (last item)

fruits.append("mango")    # add to end
fruits.remove("banana")   # remove by value
print(len(fruits))        # 3

# List slicing
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])       # [1, 2, 3]
print(numbers[::-1])      # reversed

# List comprehension
squares = [x**2 for x in range(6)]
print(squares)            # [0, 1, 4, 9, 16, 25]

# ── Dictionaries ───────────────────────
user = {
    "name": "Alice",
    "age": 25,
    "skills": ["Python", "SQL"],
}

print(user["name"])                       # Alice
print(user.get("email", "not set"))       # not set

user["email"] = "alice@example.com"
for key, value in user.items():
    print(f"  {key}: {value}")`,
    };
  }

  if (
    t.includes("class") ||
    t.includes("oop") ||
    t.includes("object") ||
    t.includes("inherit")
  ) {
    return {
      topicTag: "OOP",
      xpReward: 90,
      codeExample: `# Object-Oriented Programming

class Dog:
    """A simple Dog class."""

    species = "Canis lupus familiaris"  # class attribute

    def __init__(self, name, breed, age):
        self.name = name       # instance attribute
        self.breed = breed
        self.age = age

    def bark(self):
        return f"{self.name} says: Woof!"

    def info(self):
        return f"{self.name} ({self.breed}), age {self.age}"

    def __repr__(self):
        return f"Dog(name={self.name!r})"


# Instantiate
buddy = Dog("Buddy", "Golden Retriever", 3)
rex   = Dog("Rex", "German Shepherd", 5)

print(buddy.bark())           # Buddy says: Woof!
print(rex.info())             # Rex (German Shepherd), age 5

# Inheritance
class GuideDog(Dog):
    def __init__(self, name, breed, age, owner):
        super().__init__(name, breed, age)
        self.owner = owner

    def guide(self):
        return f"{self.name} is guiding {self.owner}."

luna = GuideDog("Luna", "Labrador", 4, "Bob")
print(luna.guide())
print(luna.bark())            # inherited method`,
    };
  }

  // Default fallback
  return {
    topicTag: "Python",
    xpReward: 50,
    codeExample: `# Python Basics

# Hello, World!
print("Hello, World!")

# Variables
name = "Python"
version = 3.12
print(f"Welcome to {name} {version}")

# Simple arithmetic
a, b = 10, 3
print(f"{a} + {b} = {a + b}")
print(f"{a} / {b} = {a / b:.2f}")
print(f"{a} // {b} = {a // b}")  # floor division
print(f"{a} % {b} = {a % b}")    # modulus
print(f"{a} ** {b} = {a ** b}")  # exponentiation`,
  };
}

/** XP rewards by lesson index (fallback) */
export const XP_BY_INDEX = [50, 60, 70, 75, 80, 90];

export function getXpForLesson(index: number): number {
  return XP_BY_INDEX[index] ?? 100;
}
