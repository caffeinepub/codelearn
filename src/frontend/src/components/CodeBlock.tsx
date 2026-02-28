/**
 * CodeBlock — renders Python code with CSS-class-based syntax highlighting.
 * Uses a React-based token renderer to avoid dangerouslySetInnerHTML.
 */
import React from "react";

interface Token {
  type: "keyword" | "string" | "comment" | "function" | "number" | "builtin" | "plain";
  value: string;
  id: string;
}

const KEYWORDS = new Set([
  "def", "class", "import", "from", "return", "if", "elif", "else",
  "for", "while", "in", "not", "and", "or", "True", "False", "None",
  "try", "except", "finally", "with", "as", "pass", "break", "continue",
  "lambda", "yield", "global", "nonlocal", "del", "raise", "assert",
  "is", "async", "await",
]);

const BUILTINS = new Set([
  "print", "len", "range", "type", "int", "str", "float", "list",
  "dict", "set", "tuple", "bool", "input", "open", "enumerate",
  "zip", "map", "filter", "sorted", "reversed", "sum", "min", "max",
  "abs", "round", "isinstance", "hasattr", "getattr", "setattr",
  "super", "object", "property", "staticmethod", "classmethod",
]);

function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  let tokenCount = 0;
  const nextId = () => `t${tokenCount++}`;

  while (i < code.length) {
    // Comment
    if (code[i] === "#") {
      const end = code.indexOf("\n", i);
      const commentEnd = end === -1 ? code.length : end;
      tokens.push({ type: "comment", value: code.slice(i, commentEnd), id: nextId() });
      i = commentEnd;
      continue;
    }

    // Triple-quoted strings
    if (code.startsWith('"""', i) || code.startsWith("'''", i)) {
      const quote = code.slice(i, i + 3);
      const end = code.indexOf(quote, i + 3);
      const strEnd = end === -1 ? code.length : end + 3;
      tokens.push({ type: "string", value: code.slice(i, strEnd), id: nextId() });
      i = strEnd;
      continue;
    }

    // Single/double quoted strings
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") { j += 2; continue; }
        if (code[j] === q) { j++; break; }
        j++;
      }
      tokens.push({ type: "string", value: code.slice(i, j), id: nextId() });
      i = j;
      continue;
    }

    // Word / identifier
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", value: word, id: nextId() });
      } else if (BUILTINS.has(word)) {
        tokens.push({ type: "builtin", value: word, id: nextId() });
      } else {
        // Check if it follows "def " — mark as function
        const last = tokens[tokens.length - 1];
        const secondLast = tokens[tokens.length - 2];
        const isAfterDef =
          last?.value === " " && secondLast?.type === "keyword" && secondLast.value === "def";
        tokens.push({ type: isAfterDef ? "function" : "plain", value: word, id: nextId() });
      }
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      tokens.push({ type: "number", value: code.slice(i, j), id: nextId() });
      i = j;
      continue;
    }

    // Everything else (operators, spaces, newlines, punctuation)
    tokens.push({ type: "plain", value: code[i], id: nextId() });
    i++;
  }

  return tokens;
}

const TOKEN_CLASS: Record<Token["type"], string> = {
  keyword: "token-keyword",
  string: "token-string",
  comment: "token-comment",
  function: "token-function",
  number: "token-number",
  builtin: "token-builtin",
  plain: "",
};

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const tokens = tokenizePython(code);

  return (
    <pre className="bg-code p-5 overflow-x-auto m-0">
      <code className="font-mono text-sm leading-relaxed">
        {tokens.map((token) => {
          const cls = TOKEN_CLASS[token.type];
          if (!cls) {
            return <React.Fragment key={token.id}>{token.value}</React.Fragment>;
          }
          return (
            <span key={token.id} className={cls}>
              {token.value}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
