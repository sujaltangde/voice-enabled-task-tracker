import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type VoiceInputData = {
  transcribedText: string;
  voiceInputTitle: string;
  voiceInputDescription: string;
  voiceInputStatus: TaskStatus;
  voiceInputPriority: TaskPriority;
  voiceInputDueDate: string;
};

export type TaskFilters = {
  status: "ALL" | TaskStatus;
  priority: "ALL" | TaskPriority;
  dueDate: string;
  search: string;
};

export type TaskState = {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
  isUpdatingStatus: boolean;
  isAddingLoading: boolean;
  isVoiceUploading: boolean;
  voiceInput: VoiceInputData;
};

const initialState: TaskState = {
  tasks: [],
  filters: {
    status: "ALL",
    priority: "ALL",
    dueDate: "",
    search: "",
  },
  isLoading: false,
  isUpdatingStatus: false,
  isAddingLoading: false,
  isVoiceUploading: false,
  voiceInput: {
    transcribedText: "",
    voiceInputTitle: "",
    voiceInputDescription: "",
    voiceInputStatus: "TODO",
    voiceInputPriority: "MEDIUM",
    voiceInputDueDate: "",
  },
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAddingLoading: (state, action: PayloadAction<boolean>) => {
      state.isAddingLoading = action.payload;
    },
    setVoiceUploading: (state, action: PayloadAction<boolean>) => {
      state.isVoiceUploading = action.payload;
    },
    setVoiceInput: (state, action: PayloadAction<Partial<VoiceInputData>>) => {
      state.voiceInput = {
        ...state.voiceInput,
        ...action.payload,
      };
    },
    setUpdatingStatus: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingStatus = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearVoiceInput: (state) => {
      state.voiceInput = {
        transcribedText: "",
        voiceInputTitle: "",
        voiceInputDescription: "",
        voiceInputStatus: "TODO",
        voiceInputPriority: "MEDIUM",
        voiceInputDueDate: "",
      };
    },
  },
});

export const {
  setTasks,
  setLoading,
  setAddingLoading,
  setVoiceUploading,
  setVoiceInput,
  setUpdatingStatus,
  setFilters,
  clearVoiceInput,
} = taskSlice.actions;

export default taskSlice.reducer;
