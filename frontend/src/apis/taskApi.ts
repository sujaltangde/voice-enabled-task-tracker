import axios from "axios";
import { toast } from "react-toastify";
import {
  setTasks,
  setLoading,
  type Task,
  setAddingLoading,
  setUpdatingStatus,
} from "../store/taskSlice";
import { type AppDispatch, type RootState } from "../store/store";

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

type TaskApiResponse = {
  success: boolean;
  count: number;
  data: Task[];
};

export function fetchAllTasks() {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await api.get<TaskApiResponse>("/tasks");

      dispatch(setTasks(response.data.data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { message: string }) => {
            toast.error(err.message);
          });
        } else {
          const errorMessage = errorData?.message || error.message;
          toast.error(`Failed to fetch tasks: ${errorMessage}`);
        }
        
        console.error(
          "Error fetching tasks:",
          error.response?.data || error.message
        );
      } else {
        toast.error("Unexpected error while fetching tasks");
        console.error("Unexpected error:", error);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function addTask(task: Task) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setAddingLoading(true));

      await api.post<TaskApiResponse>("/tasks", task);
      
      toast.success("Task created successfully!");
      dispatch(fetchAllTasks());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { message: string }) => {
            toast.error(err.message);
          });
        } else {
          const errorMessage = errorData?.message || error.message;
          toast.error(`Failed to create task: ${errorMessage}`);
        }
      } else {
        toast.error("Unexpected error while creating task");
      }
      console.error("Error adding task:", error);
    } finally {
      dispatch(setAddingLoading(false));
    }
  };
}

export function updateTaskStatus(id: string, status: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const {
        task: { tasks },
      } = getState();

      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, status: status as Task["status"] } : t
      );

      dispatch(setTasks(updatedTasks));
      dispatch(setUpdatingStatus(true));

      await api.patch(`/tasks/${id}/status`, { status });

      toast.success("Task status updated successfully!");
    } catch (error) {
      const {
        task: { tasks },
      } = getState();
      if (!tasks.find((t) => t.id === id || t.status === status)) {
      }

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { message: string }) => {
            toast.error(err.message);
          });
        } else {
          const errorMessage = errorData?.message || error.message;
          toast.error(`Failed to update task status: ${errorMessage}`);
        }
      } else {
        toast.error("Unexpected error while updating task status");
      }
      console.error("Error updating task status:", error);
    } finally {
      dispatch(setUpdatingStatus(false));
    }
  };
}

export function updateTask(id: string, task: Partial<Task>) {
  return async (dispatch: AppDispatch) => {
    try {
      await api.put(`/tasks/${id}`, task);
      
      toast.success("Task updated successfully!");
      dispatch(fetchAllTasks());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { message: string }) => {
            toast.error(err.message);
          });
        } else {
          const errorMessage = errorData?.message || error.message;
          toast.error(`Failed to update task: ${errorMessage}`);
        }
      } else {
        toast.error("Unexpected error while updating task");
      }
      console.error("Error updating task:", error);
    }
  };
}

export function deleteTask(id: string) {
  return async (dispatch: AppDispatch) => {
    try {
      await api.delete(`/tasks/${id}`);
      
      toast.success("Task deleted successfully!");
      dispatch(fetchAllTasks());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { message: string }) => {
            toast.error(err.message);
          });
        } else {
          const errorMessage = errorData?.message || error.message;
          toast.error(`Failed to delete task: ${errorMessage}`);
        }
      } else {
        toast.error("Unexpected error while deleting task");
      }
      console.error("Error deleting task:", error);
    }
  };
}

export async function uploadVoiceAudio(audioBlob: Blob) {
  try {
    const formData = new FormData();
    formData.append("voice", audioBlob, "audio.webm");

    const response = await api.post("/tasks/voice", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Audio uploaded successfully!");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: { message: string }) => {
          toast.error(err.message);
        });
      } else {
        const errorMessage = errorData?.message || error.message;
        toast.error(`Failed to upload audio: ${errorMessage}`);
      }
    } else {
      toast.error("Unexpected error while uploading audio");
    }
    console.error("Error uploading audio:", error);
    throw error;
  }
}
