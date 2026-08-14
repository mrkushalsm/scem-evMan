import z from "zod/v3";
// import { BaseProblem, CodingProblem, MCQProblem } from "./problem.types";

// type CreateFrom<T extends BaseProblem> = Omit<T, "id">;
// type UpdateFrom<T extends BaseProblem> = Partial<Omit<T, "id">>;

// export type CodingProblemCreate = CreateFrom<CodingProblem>;
// export type CodingProblemUpdate = UpdateFrom<CodingProblem>;

// export type MCQProblemCreate = CreateFrom<MCQProblem>;
// export type MCQProblemUpdate = UpdateFrom<MCQProblem>;

const codingSchema = z.object({
  id: z.string().optional(),
  type: z.literal("coding"),
  title: z.string().min(1),
  description: z.string().min(1),
  points: z.coerce.number().min(0),
  difficulty: z.enum(["easy", "medium", "hard"]),
  inputFormat: z.string().min(1),
  outputFormat: z.string().min(1),
  constraints: z.array(z.string().min(1)),
  boilerplate: z
    .record(z.string().optional())
    .refine((val) => Object.values(val).some((v) => v && v.trim() !== ""), {
      message: "At least one boilerplate must be filled.",
    }),
  functionName: z.string().min(1, "Function name is required"),
  inputVariables: z
    .array(
      z.object({
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
      })
    )
    .min(1, "At least one input variable is required"),
  testCases: z
    .array(
      z.object({
        input: z.any(),
        output: z.string().min(1, "Expected output is required"),
        explanation: z.string().optional(),
        isVisible: z.boolean().default(false),
      })
    )
    .optional(), // Optional initially, but encouraged
});

const mcqSchema = z.object({
  id: z.string().optional(),
  type: z.literal("mcq"),
  title: z.string().min(1),
  description: z.string().min(1),
  points: z.coerce.number().min(0),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum(["single", "multiple"]),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1),
      })
    )
    .length(4, "Exactly 4 options are required"),
  correctAnswer: z
    .string()
    .min(1, "Please select at least one correct option."),
});

export const questionSchema = z.discriminatedUnion("type", [
  codingSchema,
  mcqSchema,
]);

export type QuestionSchema = z.infer<typeof questionSchema>;
