import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { AppError, asyncHandler } from "../middlewares/errorHandler";
import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";

const taskRepository = AppDataSource.getRepository(Task);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing. Please set it in the .env file.");
}
const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskRepository.find({
    order: {
      created_at: "DESC",
    },
  });

  const serializedTasks = tasks.map((task) => ({
    ...task,
    due_date: task.due_date ? moment(task.due_date).format("YYYY-MM-DD") : null,
    created_at: moment(task.created_at).toISOString(),
    updated_at: moment(task.updated_at).toISOString(),
  }));

  res.status(200).json({
    success: true,
    count: serializedTasks.length,
    data: serializedTasks,
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, status, priority, due_date } = req.body;

  const taskData: Partial<Task> = {
    id: uuidv4(),
    title: title.trim(),
    status: status ?? "TODO",
    priority: priority ?? "MEDIUM",
  };

  if (description && typeof description === "string" && description.trim()) {
    taskData.description = description.trim();
  }

  if (due_date) {
    taskData.due_date = moment(due_date).toDate();
  }

  const newTask = taskRepository.create(taskData);
  const savedTask = await taskRepository.save(newTask);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: savedTask,
  });
});

export const updateTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const task = await taskRepository.findOne({ where: { id: id as string } });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    task.status = status;
    const updatedTask = await taskRepository.save(task);

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  }
);

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  const task = await taskRepository.findOne({ where: { id: id as string } });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (title !== undefined) {
    task.title = title.trim();
  }

  if (description !== undefined) {
    if (description && description.trim()) {
      task.description = description.trim();
    } else {
      delete task.description;
    }
  }

  if (status !== undefined) {
    task.status = status;
  }

  if (priority !== undefined) {
    task.priority = priority;
  }

  if (due_date !== undefined) {
    if (due_date) {
      task.due_date = moment(due_date).toDate();
    } else {
      delete task.due_date;
    }
  }

  const updatedTask = await taskRepository.save(task);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: updatedTask,
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await taskRepository.findOne({ where: { id: id as string } });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await taskRepository.remove(task);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: { id },
  });
});

export const createTaskFromVoice = asyncHandler(
  async (req: Request, res: Response) => {

    const files = req.files as { [key: string]: any } | undefined;

    if (!files || !files.voice) {
      throw new AppError("No audio file uploaded", 400);
    }

    const audioFile = files.voice;

    let transcript = "";
    let taskData: any;

    try {
      const formData = new FormData();
      formData.append("file", audioFile.data, {
        filename: audioFile.name,
        contentType: audioFile.mimetype,
      });
      formData.append("model_id", "scribe_v1");
      formData.append("language_code", "eng");
      formData.append("diarize", "true");
      formData.append("tag_audio_events", "true");

      const response = await axios.post(
        "https://api.elevenlabs.io/v1/speech-to-text",
        formData,
        {
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
            ...formData.getHeaders(),
          },
        }
      );

      transcript = response?.data?.text ?? "";

      const prompt = `You are a task parser. Parse the following voice transcript and extract task information.
      
Transcript: "${transcript}"

Current date and time: "${moment().format('YYYY-MM-DD HH:mm:ss')}"

Extract and return ONLY a valid JSON object (no markdown, no code blocks) with the following structure:
{
  "title": "brief task title (max 100 chars)",
  "description": "detailed description if available, otherwise leave empty string",
  "status": "TODO or IN_PROGRESS or DONE",
  "priority": "LOW or MEDIUM or HIGH",
  "due_date": "YYYY-MM-DD format if date/time"
}

Rules:
- If no specific status is mentioned, use "TODO"
- If no priority is mentioned, use "MEDIUM"
- Parse relative dates like "tomorrow", "next Monday", "in 3 days" using the current date/time provided above
- Parse absolute dates like "January 15", "Dec 25th" into YYYY-MM-DD format
- If any date or time reference is mentioned (relative or absolute), calculate and include due_date
- If no date/time is mentioned at all, set due_date to null
- Return ONLY the JSON object, nothing else`;

      const aiResponse = await openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
      });

      const parsedText =
        aiResponse.output_text ||
        ((aiResponse as any).output?.[0]?.content?.[0]?.text as string | undefined) ||
        "";
      
      try {
        const cleanedText = parsedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        taskData = JSON.parse(cleanedText);
      } catch (parseError) {
        taskData = {
          title: transcript.substring(0, 100),
          description: transcript,
          status: "TODO",
          priority: "MEDIUM",
          due_date: null,
        };
      }

    } catch (error: any) {
      throw new AppError("Failed to transcribe audio", 500);
    }

    res.status(200).json({
      success: true,
      transcript: transcript,
      data: taskData,
    });
  }
);
