import express from "express";
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  createTaskFromVoice,
} from "../controllers/taskController";
import { validate } from "../middlewares/validate";
import {
  createTaskSchema,
  updateTaskStatusSchema,
  updateTaskSchema,
  deleteTaskSchema,
  createTaskFromVoiceSchema,
} from "../validations/taskValidation";

const router = express.Router();

router.get("/", getAllTasks);

router.post("/", validate(createTaskSchema), createTask);

router.post("/voice", validate(createTaskFromVoiceSchema), createTaskFromVoice);

router.patch("/:id/status", validate(updateTaskStatusSchema), updateTaskStatus);

router.put("/:id", validate(updateTaskSchema), updateTask);

router.delete("/:id", validate(deleteTaskSchema), deleteTask);

export default router;

