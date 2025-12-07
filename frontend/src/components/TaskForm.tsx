import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { addTask } from "../apis/taskApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Task } from "../store/taskSlice";
import { MdKeyboardVoice } from "react-icons/md";
import VoiceInput from "./VoiceInput";
import { clearVoiceInput } from "../store/taskSlice";

type StatusKey = "TODO" | "IN_PROGRESS" | "DONE";
type PriorityKey = "LOW" | "MEDIUM" | "HIGH";

type TaskFormValues = {
  title: string;
  description: string;
  status: StatusKey;
  priority: PriorityKey;
  dueDate: string; // date string from date input (YYYY-MM-DD)
};

const statusOptions: { label: string; value: StatusKey }[] = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const priorityOptions: { label: string; value: PriorityKey }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

function TaskForm() {
  const dispatch = useAppDispatch();
  const isAddingLoading = useAppSelector((state) => state.task.isAddingLoading);
  const isVoiceUploading = useAppSelector((state) => state.task.isVoiceUploading);
  const voiceInput = useAppSelector((state) => state.task.voiceInput);
  const [values, setValues] = useState<TaskFormValues>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);

  useEffect(() => {
    if (voiceInput.voiceInputTitle || voiceInput.voiceInputDescription) {
      setValues({
        title: voiceInput.voiceInputTitle || "",
        description: voiceInput.voiceInputDescription || "",
        status: voiceInput.voiceInputStatus || "TODO",
        priority: voiceInput.voiceInputPriority || "MEDIUM",
        dueDate: voiceInput.voiceInputDueDate || "",
      });
    }
  }, [voiceInput]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        due_date: values.dueDate || undefined,
      };

      await dispatch(addTask(payload as Task));

      setValues({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      });
      dispatch(clearVoiceInput());
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-3xl border border-neutral-800 rounded-lg p-4 bg-black text-white"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-col gap-3 w-full md:w-1/2">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={values.title}
                onChange={handleChange}
                className="border border-neutral-700 rounded px-3 py-2 text-sm bg-black text-white placeholder-neutral-400"
                placeholder="Enter task title"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={values.description}
                onChange={handleChange}
                className="border border-neutral-700 rounded px-3 py-2 text-sm min-h-[80px] bg-black text-white placeholder-neutral-400"
                placeholder="Add more details"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-1/2">
            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={handleChange}
                className="border border-neutral-700 rounded px-3 py-2 text-sm bg-black text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="border border-neutral-700 rounded px-3 py-2 text-sm bg-black text-white"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            value={values.dueDate}
            onChange={handleChange}
            className="border border-neutral-700 rounded px-3 py-2 text-sm bg-black text-white placeholder-neutral-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isAddingLoading || isVoiceUploading}
            className="w-3/4 border border-neutral-700 inline-flex items-center justify-center gap-2 rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isAddingLoading || isVoiceUploading) && (
              <AiOutlineLoading className="animate-spin h-4 w-4" />
            )}
            {isAddingLoading
              ? "Creating..."
              : isVoiceUploading
              ? "Processing voice..."
              : "Create Task"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVoiceInputOpen(true);
            }}
            disabled={isVoiceUploading}
            className="w-1/4 border border-neutral-700 inline-flex items-center justify-center gap-2 rounded bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-900 hover:border-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Voice input"
          >
            {isVoiceUploading ? (
              <AiOutlineLoading className="animate-spin h-4 w-4" />
            ) : (
              <MdKeyboardVoice size={20} />
            )}
          </button>
        </div>
        {voiceInput.transcribedText && (
          <div className="flex flex-col gap-2 border border-neutral-700 rounded p-3 bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase">
                Transcript:
              </span>
              <button
                type="button"
                onClick={() => dispatch(clearVoiceInput())}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <p className="text-sm text-white">{voiceInput.transcribedText}</p>
          </div>
        )}
      </form>

      <VoiceInput
        isOpen={isVoiceInputOpen}
        onClose={() => setIsVoiceInputOpen(false)}
      />
    </>
  );
}

export default TaskForm;
