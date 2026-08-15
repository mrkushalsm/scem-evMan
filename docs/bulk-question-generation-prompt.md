# Bulk Question Generation — Prompt Template

A self-contained, reusable prompt for generating a bulk-import question set.
Fill in the `{{ }}` placeholders and paste the whole "Prompt" section below
into any AI chat tool. The resulting JSON can be pasted directly into the
platform's bulk question import.

---

## Prompt

You are generating a bulk-import question set for a coding assessment
platform. Your output must be a single JSON document that validates against
the schema described below. Follow every rule exactly — the file will be
parsed and inserted into a database without manual correction.

### 1. Output contract

Return **only** valid JSON — no markdown fences, no comments, no trailing
commas, no prose before or after. Top-level shape:

```json
{
  "questions": [ /* array of question objects, coding and/or mcq, see §3 */ ],
  "meta": {
    "description": "{{one-line description of this batch}}"
  }
}
```

### 2. What to generate

- Topic: **{{topic, e.g. "arrays and hashing"}}**
- Count: **{{N}} questions**, distributed LeetCode-style across difficulty:
  roughly a third Easy, a third Medium, a third Hard (adjust ratio if
  told otherwise).
- Question type: **{{"coding", "mcq", or a mix}}**
- Each question must be original, in the spirit of LeetCode — a clear
  title, an unambiguous problem/prompt, and a single well-defined correct
  answer.

### 3. Question object shapes

Two question types share one array. Each object has a `type` field of
either `"coding"` or `"mcq"`, with the fields below.

**Coding:**

```json
{
  "type": "coding",
  "title": "string",
  "description": "string — the full problem statement",
  "marks": 10,
  "difficulty": "Easy" | "Medium" | "Hard",
  "constraints": "string — one constraint per line, no numbering",
  "inputFormat": "string — describes the function's parameters, see §6",
  "outputFormat": "string — describes what's printed to stdout, see §6",
  "functionName": "string — camelCase, e.g. twoSum",
  "inputVariables": [
    { "variable": "string", "type": "int" | "float" | "char" | "string" | "int_array" | "float_array" | "string_array" }
  ],
  "testcases": [
    { "input": "string", "output": "string", "isVisible": true, "explanation": "string (optional, required when isVisible is true)" }
  ]
}
```

**MCQ:**

```json
{
  "type": "mcq",
  "title": "string",
  "description": "string — the question prompt",
  "marks": 10,
  "difficulty": "Easy" | "Medium" | "Hard",
  "questionType": "Single Correct" | "Multiple Correct",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string — must exactly match one entry in options (for Multiple Correct, use a JSON array of exact option strings instead of a single string — the importer does not split on commas)"
}
```

`marks` convention: Easy = 10, Medium = 20, Hard = 30 (override if told
otherwise).

### 4. Worked examples

<details open>
<summary>Example coding question</summary>

```json
{
  "type": "coding",
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and the same element may not be used twice.",
  "marks": 10,
  "difficulty": "Easy",
  "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
  "inputFormat": "The function receives nums (a list of integers) and target (an integer).",
  "outputFormat": "Return two space-separated integers: the indices of the two numbers that add up to target, in ascending order.",
  "functionName": "twoSum",
  "inputVariables": [
    { "variable": "nums", "type": "int_array" },
    { "variable": "target", "type": "int" }
  ],
  "testcases": [
    { "input": "4 2 7 11 15 9", "output": "0 1", "isVisible": true, "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so the answer is [0, 1]." },
    { "input": "3 3 2 4 6", "output": "1 2", "isVisible": true, "explanation": "nums[1] + nums[2] = 2 + 4 = 6, so the answer is [1, 2]." },
    { "input": "2 3 3 6", "output": "0 1", "isVisible": true, "explanation": "The same value 3 appears twice at different indices, and they sum to target." },
    { "input": "2 0 0 0", "output": "0 1", "isVisible": false },
    { "input": "2 -3 4 1", "output": "0 1", "isVisible": false }
  ]
}
```

</details>

<details open>
<summary>Example MCQ question</summary>

```json
{
  "type": "mcq",
  "title": "Time complexity of binary search",
  "description": "What is the time complexity of binary search on a sorted array of n elements?",
  "marks": 10,
  "difficulty": "Easy",
  "questionType": "Single Correct",
  "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
  "correctAnswer": "O(log n)"
}
```

</details>

### 5. Test case requirements for coding questions — read carefully

Each coding question needs **exactly 13 test cases**:

- **10 hidden** (`isVisible: false`) — used for grading. Together they must
  exercise correctness *and* edge cases: minimum-size input, maximum-size
  input allowed by the stated constraints, duplicate values, negative
  numbers (if applicable to the domain), zero/empty values where legal, and
  at least one case that would trip up a naive/incorrect solution. Omit the
  `explanation` field entirely for these.
- **3 visible** (`isVisible: true`) — shown to the user as worked examples
  before they run any code. Each **must** include a non-empty
  `explanation` that walks through why the output is correct for that
  specific input, LeetCode-style.

Every test case, hidden or visible, must be **unambiguous**: for the given
input there is exactly one correct output, fully determined by the problem
statement and constraints (no "any valid answer accepted" ambiguity unless
the statement explicitly defines a tie-breaking rule and the expected
output follows it).

### 6. `input` / `output` encoding for test cases — this is not free text

The grading harness does not pass structured JSON to the judge; it flattens
each test case into raw **stdin**, and compares raw **stdout**. Both fields
must be written as flat, whitespace-separated strings, positionally
matching `inputVariables` in the order they're declared:

- Scalar types (`int`, `float`, `char`, `string`) → the value itself as a
  token (e.g. `9`).
- Array types (`int_array`, `float_array`, `string_array`) → the array's
  **length**, followed by its elements, all space-separated (e.g. the array
  `[2, 7, 11, 15]` becomes `4 2 7 11 15`).
- Multiple variables are concatenated left-to-right, space-separated.

`output` follows the same flattening rule for whatever the program prints.

This flat stdin/stdout encoding is purely an implementation detail of the
grading harness — it is **not** what the learner sees or writes code for.
The harness auto-generates a function stub matching `functionName` and
`inputVariables`, reads stdin, splits it back into typed parameters per the
rule above, and calls the learner's function directly — e.g. for
`functionName: "twoSum"` with `inputVariables = [nums: int_array, target:
int]`, the learner is handed something like:

```python
def twoSum(nums, target):
    # write your code here
```

The harness then prints whatever the function **returns**. So the two
human-facing format fields describe two different halves of this pipeline:

- **`inputFormat`** describes the **function's parameters** — their names,
  types, and meaning — matching `inputVariables`, e.g. "The function
  receives `nums` (a list of integers) and `target` (an integer)." Do
  **not** describe it as a stdin-parsing task (e.g. "First line contains
  n and target...") — the learner never reads stdin themselves.
- **`outputFormat`** describes **what ends up on stdout** (the harness
  prints the function's return value for you), e.g. "Return two
  space-separated integers: the indices of the two numbers that add up to
  target." Be explicit that it's printed as space-separated values, not
  returned as a structured object — that's what the stdout comparison in
  this section actually checks against `output`.

### 7. Supported data types

Only these `inputVariables[].type` values are valid for coding questions:

| type | meaning |
|---|---|
| `int` | signed integer |
| `float` | floating point number |
| `char` | single character |
| `string` | text token (no embedded whitespace) |
| `int_array` | array of integers, length-prefixed per §6 |
| `float_array` | array of floats, length-prefixed per §6 |
| `string_array` | array of string tokens, length-prefixed per §6 |

### 8. Supported languages

Coding submissions are judged in **C, Java, and Python** only. Starter code
for all three is generated automatically from `functionName` and
`inputVariables` — do not include language-specific boilerplate in the
output unless explicitly asked to.

### 9. Style guidance

- Titles and phrasing should read like real LeetCode problems — concise,
  no filler, precise constraints using standard notation (`1 <= n <= 10^4`).
- Vary problem domains within the requested topic so the set isn't
  repetitive (e.g. don't generate 10 variations of the same array-sum
  problem).
- Do not reuse example values between the 3 visible test cases in a single
  coding question — each should use different input values so they
  collectively illustrate different behavior, not just the happy path
  three times.
- For MCQ questions, distractor options must be plausible (not obviously
  wrong) and only one option (or the stated set, for Multiple Correct) may
  be correct.

---

## Example: the prompt fully filled in

Only §1 and §2 above contain placeholders — everything else stays as-is.
Here's what the whole thing looks like once filled in for a request of "12
easy-to-hard coding questions on arrays and hashing." This is the literal
text you'd paste into an AI chat tool.

<details>
<summary>Show the fully filled-in prompt</summary>

`````text
You are generating a bulk-import question set for a coding assessment
platform. Your output must be a single JSON document that validates against
the schema described below. Follow every rule exactly — the file will be
parsed and inserted into a database without manual correction.

### 1. Output contract

Return **only** valid JSON — no markdown fences, no comments, no trailing
commas, no prose before or after. Top-level shape:

```json
{
  "questions": [ /* array of question objects, coding and/or mcq, see §3 */ ],
  "meta": {
    "description": "12 LeetCode-style coding questions on arrays and hashing, Easy to Hard"
  }
}
```

### 2. What to generate

- Topic: **arrays and hashing**
- Count: **12 questions**, distributed LeetCode-style across difficulty:
  roughly a third Easy, a third Medium, a third Hard (adjust ratio if
  told otherwise).
- Question type: **coding only**
- Each question must be original, in the spirit of LeetCode — a clear
  title, an unambiguous problem/prompt, and a single well-defined correct
  answer.

### 3. Question object shapes

Two question types share one array. Each object has a `type` field of
either `"coding"` or `"mcq"`, with the fields below.

**Coding:**

```json
{
  "type": "coding",
  "title": "string",
  "description": "string — the full problem statement",
  "marks": 10,
  "difficulty": "Easy" | "Medium" | "Hard",
  "constraints": "string — one constraint per line, no numbering",
  "inputFormat": "string — describes the function's parameters, see §6",
  "outputFormat": "string — describes what's printed to stdout, see §6",
  "functionName": "string — camelCase, e.g. twoSum",
  "inputVariables": [
    { "variable": "string", "type": "int" | "float" | "char" | "string" | "int_array" | "float_array" | "string_array" }
  ],
  "testcases": [
    { "input": "string", "output": "string", "isVisible": true, "explanation": "string (optional, required when isVisible is true)" }
  ]
}
```

**MCQ:**

```json
{
  "type": "mcq",
  "title": "string",
  "description": "string — the question prompt",
  "marks": 10,
  "difficulty": "Easy" | "Medium" | "Hard",
  "questionType": "Single Correct" | "Multiple Correct",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string — must exactly match one entry in options (for Multiple Correct, use a JSON array of exact option strings instead of a single string — the importer does not split on commas)"
}
```

`marks` convention: Easy = 10, Medium = 20, Hard = 30 (override if told
otherwise).

### 4. Worked examples

Example coding question:

```json
{
  "type": "coding",
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and the same element may not be used twice.",
  "marks": 10,
  "difficulty": "Easy",
  "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
  "inputFormat": "The function receives nums (a list of integers) and target (an integer).",
  "outputFormat": "Return two space-separated integers: the indices of the two numbers that add up to target, in ascending order.",
  "functionName": "twoSum",
  "inputVariables": [
    { "variable": "nums", "type": "int_array" },
    { "variable": "target", "type": "int" }
  ],
  "testcases": [
    { "input": "4 2 7 11 15 9", "output": "0 1", "isVisible": true, "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so the answer is [0, 1]." },
    { "input": "3 3 2 4 6", "output": "1 2", "isVisible": true, "explanation": "nums[1] + nums[2] = 2 + 4 = 6, so the answer is [1, 2]." },
    { "input": "2 3 3 6", "output": "0 1", "isVisible": true, "explanation": "The same value 3 appears twice at different indices, and they sum to target." },
    { "input": "2 0 0 0", "output": "0 1", "isVisible": false },
    { "input": "2 -3 4 1", "output": "0 1", "isVisible": false }
  ]
}
```

Example MCQ question:

```json
{
  "type": "mcq",
  "title": "Time complexity of binary search",
  "description": "What is the time complexity of binary search on a sorted array of n elements?",
  "marks": 10,
  "difficulty": "Easy",
  "questionType": "Single Correct",
  "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
  "correctAnswer": "O(log n)"
}
```

(Since this batch is coding-only, omit MCQ objects from the actual output —
this example is included only to show the shape.)

### 5. Test case requirements for coding questions — read carefully

Each coding question needs **exactly 13 test cases**:

- **10 hidden** (`isVisible: false`) — used for grading. Together they must
  exercise correctness *and* edge cases: minimum-size input, maximum-size
  input allowed by the stated constraints, duplicate values, negative
  numbers (if applicable to the domain), zero/empty values where legal, and
  at least one case that would trip up a naive/incorrect solution. Omit the
  `explanation` field entirely for these.
- **3 visible** (`isVisible: true`) — shown to the user as worked examples
  before they run any code. Each **must** include a non-empty
  `explanation` that walks through why the output is correct for that
  specific input, LeetCode-style.

Every test case, hidden or visible, must be **unambiguous**: for the given
input there is exactly one correct output, fully determined by the problem
statement and constraints (no "any valid answer accepted" ambiguity unless
the statement explicitly defines a tie-breaking rule and the expected
output follows it).

### 6. `input` / `output` encoding for test cases — this is not free text

The grading harness does not pass structured JSON to the judge; it flattens
each test case into raw **stdin**, and compares raw **stdout**. Both fields
must be written as flat, whitespace-separated strings, positionally
matching `inputVariables` in the order they're declared:

- Scalar types (`int`, `float`, `char`, `string`) → the value itself as a
  token (e.g. `9`).
- Array types (`int_array`, `float_array`, `string_array`) → the array's
  **length**, followed by its elements, all space-separated (e.g. the array
  `[2, 7, 11, 15]` becomes `4 2 7 11 15`).
- Multiple variables are concatenated left-to-right, space-separated.

`output` follows the same flattening rule for whatever the program prints.

This flat stdin/stdout encoding is purely an implementation detail of the
grading harness — it is **not** what the learner sees or writes code for.
The harness auto-generates a function stub matching `functionName` and
`inputVariables`, reads stdin, splits it back into typed parameters per the
rule above, and calls the learner's function directly — e.g. for
`functionName: "twoSum"` with `inputVariables = [nums: int_array, target:
int]`, the learner is handed something like:

```python
def twoSum(nums, target):
    # write your code here
```

The harness then prints whatever the function **returns**. So the two
human-facing format fields describe two different halves of this pipeline:

- **`inputFormat`** describes the **function's parameters** — their names,
  types, and meaning — matching `inputVariables`, e.g. "The function
  receives `nums` (a list of integers) and `target` (an integer)." Do
  **not** describe it as a stdin-parsing task (e.g. "First line contains
  n and target...") — the learner never reads stdin themselves.
- **`outputFormat`** describes **what ends up on stdout** (the harness
  prints the function's return value for you), e.g. "Return two
  space-separated integers: the indices of the two numbers that add up to
  target." Be explicit that it's printed as space-separated values, not
  returned as a structured object — that's what the stdout comparison in
  this section actually checks against `output`.

### 7. Supported data types

Only these `inputVariables[].type` values are valid for coding questions:

| type | meaning |
|---|---|
| `int` | signed integer |
| `float` | floating point number |
| `char` | single character |
| `string` | text token (no embedded whitespace) |
| `int_array` | array of integers, length-prefixed per §6 |
| `float_array` | array of floats, length-prefixed per §6 |
| `string_array` | array of string tokens, length-prefixed per §6 |

### 8. Supported languages

Coding submissions are judged in **C, Java, and Python** only. Starter code
for all three is generated automatically from `functionName` and
`inputVariables` — do not include language-specific boilerplate in the
output unless explicitly asked to.

### 9. Style guidance

- Titles and phrasing should read like real LeetCode problems — concise,
  no filler, precise constraints using standard notation (`1 <= n <= 10^4`).
- Vary problem domains within the requested topic so the set isn't
  repetitive (e.g. don't generate 10 variations of the same array-sum
  problem).
- Do not reuse example values between the 3 visible test cases in a single
  coding question — each should use different input values so they
  collectively illustrate different behavior, not just the happy path
  three times.
- For MCQ questions, distractor options must be plausible (not obviously
  wrong) and only one option (or the stated set, for Multiple Correct) may
  be correct.
`````

</details>

---

## Notes for whoever fills this in

- Adjust §2's topic/count/type placeholders per request; everything else in
  the prompt is meant to stay fixed so output is consistently importable.
- If the target platform's schema differs from §3 (field names, extra
  required fields, different difficulty labels, etc.), update §3, the
  examples in §4, and the type table in §7 to match before reuse.
