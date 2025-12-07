import moment from "moment";
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ message: "Title must be a string" })
      .min(1, "Title cannot be empty")
      .max(255, "Title cannot exceed 255 characters")
      .trim(),
    description: z
      .string({ message: "Description must be a string" })
      .trim()
      .nullable(),
    status: z
      .enum(["TODO", "IN_PROGRESS", "DONE"], {
        message: "Status must be To Do, In Progress, or Done",
      })
      .default("TODO"),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH"], {
        message: "Priority must be Low, Medium, or High",
      })
      .default("MEDIUM"),
    due_date: z
      .union([
        z.string().datetime({ message: "Invalid datetime format for due_date" }),
        z.string().date({ message: "Invalid date format for due_date" }),
        z.date(),
      ])
      .default(moment().format('YYYY-MM-DD'))
      .nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "Task ID must be a string" })
      .uuid("Task ID must be a valid UUID"),
  }),
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
      message: "Status must be To Do, In Progress, or Done",
    }),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "Task ID must be a string" })
      .uuid("Task ID must be a valid UUID"),
  }),
  body: z
    .object({
      title: z
        .string({ message: "Title must be a string" })
        .min(1, "Title cannot be empty")
        .max(255, "Title cannot exceed 255 characters")
        .trim()
        .optional(),
      description: z
        .string({ message: "Description must be a string" })
        .trim()
        .optional()
        .nullable(),
      status: z
        .enum(["TODO", "IN_PROGRESS", "DONE"], {
          message: "Status must be To Do, In Progress, or Done",
        })
        .optional(),
      priority: z
        .enum(["LOW", "MEDIUM", "HIGH"], {
          message: "Priority must be Low, Medium, or High",
        })
        .optional(),
      due_date: z
        .union([
          z.string().datetime({ message: "Invalid datetime format for due_date" }),
          z.string().date({ message: "Invalid date format for due_date" }),
          z.date(),
        ])
        .optional()
        .nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "Task ID must be a string" })
      .uuid("Task ID must be a valid UUID"),
  }),
});

export const createTaskFromVoiceSchema = z.object({
  files: z
    .any()
    .refine((files) => files !== undefined && files !== null, {
      message: "No files uploaded. Please upload an audio file.",
    })
    .refine((files) => files && files.voice !== undefined, {
      message: "Voice audio file is required. Please upload a file with field name 'voice'.",
    })
    .refine(
      (files) =>
        files &&
        files.voice &&
        [
          "audio/webm",
          "audio/wav",
          "audio/mp3",
          "audio/mpeg",
          "audio/ogg",
          "audio/mp4",
        ].includes(files.voice.mimetype),
      {
        message:
          "Invalid file type. Only audio files (webm, wav, mp3, mpeg, ogg, mp4) are allowed",
      }
    )
    .refine((files) => files && files.voice && files.voice.size > 0, {
      message: "Audio file cannot be empty",
    })
    .refine(
      (files) => files && files.voice && files.voice.size <= 10 * 1024 * 1024,
      {
        message: "Audio file size cannot exceed 10MB",
      }
    )
    .refine((files) => files && files.voice && !files.voice.truncated, {
      message: "File upload was truncated. Please try again",
    }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type CreateTaskFromVoiceInput = z.infer<typeof createTaskFromVoiceSchema>;

