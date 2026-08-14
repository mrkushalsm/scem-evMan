const { z } = require("zod");

// Base schema for all questions
const baseQuestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  marks: z.number().min(0, "Marks must be non-negative"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .optional()
    .default("Medium"),
});

// Input variable schema
const inputVariableSchema = z.object({
  variable: z.string().min(1, "Variable name is required"),
  type: z.enum([
    "int",
    "float",
    "char",
    "string",
    "int_array",
    "float_array",
    "string_array",
  ]),
});

// Test case schema
const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string(),
  explanation: z.string().optional(),
  isVisible: z.boolean().optional().default(false),
});

// Coding question schema
const codingQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("coding"),
  inputFormat: z.string().min(1, "Input format is required"),
  outputFormat: z.string().min(1, "Output format is required"),
  constraints: z.string().optional(),
  boilerplateCode: z
    .record(z.string(), z.string())
    .optional(),
  functionName: z.string().min(1, "Function name is required"),
  inputVariables: z
    .array(inputVariableSchema)
    .min(1, "At least one input variable is required"),
  testcases: z.array(testCaseSchema).optional(),
});

// MCQ question schema
const mcqQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("mcq"),
  questionType: z
    .enum(["Single Correct", "Multiple Correct"])
    .optional()
    .default("Single Correct"),
  options: z
    .array(z.string().min(1, "Option text cannot be empty"))
    .min(2, "At least 2 options are required")
    .max(10, "Maximum 10 options allowed"),
  correctAnswer: z.union([
    z.string().min(1, "At least one correct answer is required"),
    z.array(z.string().min(1)).min(1, "At least one correct answer is required"),
  ]),
  multipleCorrect: z.boolean().optional(),
});

// Combined question schema (discriminated union)
const questionSchema = z.discriminatedUnion("type", [
  codingQuestionSchema,
  mcqQuestionSchema,
]);

const singleQuestionSchema = questionSchema;

const bulkImportSchema = z.object({
  questions: z.array(questionSchema),
  meta: z
    .object({
      type: z.string().optional(),
      description: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

// Flexible import that accepts either format
const importInputSchema = z.union([
  bulkImportSchema,
  questionSchema,
]);

// Export schema
const exportPayloadSchema = z.object({
  questions: z.array(questionSchema),
  meta: z.object({
    exportDate: z.string(),
    format: z.literal("v1"),
    count: z.number().min(0),
  }),
});

module.exports = {
  questionSchema,
  singleQuestionSchema,
  bulkImportSchema,
  importInputSchema,
  exportPayloadSchema,
};
