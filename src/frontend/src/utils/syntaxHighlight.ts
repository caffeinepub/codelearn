/**
 * Simple Python syntax highlighter — returns HTML string with span classes.
 */
export function highlightPython(code: string): string {
  const keywords = [
    "def",
    "class",
    "import",
    "from",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "in",
    "not",
    "and",
    "or",
    "True",
    "False",
    "None",
    "try",
    "except",
    "finally",
    "with",
    "as",
    "pass",
    "break",
    "continue",
    "lambda",
    "yield",
    "global",
    "nonlocal",
    "del",
    "raise",
    "assert",
    "is",
    "async",
    "await",
  ];

  const builtins = [
    "print",
    "len",
    "range",
    "type",
    "int",
    "str",
    "float",
    "list",
    "dict",
    "set",
    "tuple",
    "bool",
    "input",
    "open",
    "enumerate",
    "zip",
    "map",
    "filter",
    "sorted",
    "reversed",
    "sum",
    "min",
    "max",
    "abs",
    "round",
    "isinstance",
    "hasattr",
    "getattr",
    "setattr",
    "super",
    "object",
    "property",
    "staticmethod",
    "classmethod",
  ];

  // Escape HTML first
  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments (# ...)
  result = result.replace(
    /(#[^\n]*)/g,
    '<span class="token-comment">$1</span>',
  );

  // Strings (triple and single quotes)
  result = result.replace(
    /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
    (match) => {
      // Don't re-highlight already inside a comment span
      if (match.startsWith("<span")) return match;
      return `<span class="token-string">${match}</span>`;
    },
  );

  // Numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="token-number">$1</span>',
  );

  // Builtins
  const builtinRegex = new RegExp(`\\b(${builtins.join("|")})\\b`, "g");
  result = result.replace(
    builtinRegex,
    '<span class="token-builtin">$1</span>',
  );

  // Keywords
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  result = result.replace(
    keywordRegex,
    '<span class="token-keyword">$1</span>',
  );

  // Function definitions (function name after def)
  result = result.replace(
    /(<span class="token-keyword">def<\/span>) ([a-zA-Z_]\w*)/g,
    '$1 <span class="token-function">$2</span>',
  );

  return result;
}
