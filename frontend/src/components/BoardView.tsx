import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskCard, {
  type TaskCardProps,
  type StatusKey,
} from "./TaskCard";
import TaskEditModal from "./TaskEditModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAllTasks, updateTaskStatus } from "../apis/taskApi";
import type { Task } from "../store/taskSlice";

type BoardTask = TaskCardProps;

type ColumnConfig = {
  key: StatusKey;
  title: string;
};

const columns: ColumnConfig[] = [
  { key: "TODO", title: "To Do" },
  { key: "IN_PROGRESS", title: "In Progress" },
  { key: "DONE", title: "Done" },
];

function DraggableTask({
  task,
  onTaskClick,
}: {
  task: BoardTask;
  onTaskClick: (task: BoardTask) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <TaskCard {...task} onClick={() => onTaskClick(task)} />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onDrop,
  onTaskClick,
}: {
  column: ColumnConfig;
  tasks: BoardTask[];
  onDrop: (taskId: string, newStatus: StatusKey) => void;
  onTaskClick: (task: BoardTask) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string; status: StatusKey }) => {
      if (item.status !== column.key) {
        onDrop(item.id, column.key);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
          {column.title}
        </span>
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
          {tasks.length}
        </span>
      </div>

      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`min-h-[120px] space-y-3 rounded-md border border-dashed p-2 transition-colors ${
          isOver
            ? "border-neutral-600 bg-neutral-900/60"
            : "border-neutral-800 bg-neutral-950/40"
        }`}
      >
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} onTaskClick={onTaskClick} />
        ))}
        {tasks.length === 0 && (
          <p className="py-4 text-center text-[11px] text-neutral-500">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

function BoardView() {
  const dispatch = useAppDispatch();
  const {
    tasks: reduxTasks,
    isLoading,
    filters,
    isUpdatingStatus,
  } = useAppSelector((state) => state.task);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const normalizedSearch = filters.search.trim().toLowerCase();

  const filteredTasks = reduxTasks.filter((task) => {
    const matchesStatus =
      filters.status === "ALL" || task.status === filters.status;

    const matchesPriority =
      filters.priority === "ALL" || task.priority === filters.priority;

    const taskDueDateStr =
      typeof task.due_date === "string" ? task.due_date.slice(0, 10) : "";

    const matchesDueDate =
      !filters.dueDate ||
      (taskDueDateStr !== "" && taskDueDateStr === filters.dueDate);

    const title = task.title.toLowerCase();
    const description = (task.description ?? "").toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch);

    return (
      matchesStatus && matchesPriority && matchesDueDate && matchesSearch
    );
  });

  const tasks: BoardTask[] = filteredTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date || undefined,
  }));

  const handleDrop = (taskId: string, newStatus: StatusKey) => {
    dispatch(updateTaskStatus(taskId, newStatus));
  };

  const handleTaskClick = (task: BoardTask) => {
    const fullTask = reduxTasks.find((t) => t.id === task.id);
    if (fullTask) {
      setSelectedTask(fullTask);
      setIsModalOpen(true);
    }
  };

  const tasksByStatus = (status: StatusKey) =>
    tasks.filter((task) => task.status === status);

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl rounded-lg border border-neutral-800 bg-black p-4 text-white">
        <h2 className="mb-4 text-sm font-semibold text-neutral-100">Board</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-neutral-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full max-w-5xl rounded-lg border border-neutral-800 bg-black p-4 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">Board</h2>
          {isUpdatingStatus && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Updating task...</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          {columns.map((column) => (
            <DroppableColumn
              key={column.key}
              column={column}
              tasks={tasksByStatus(column.key)}
              onDrop={handleDrop}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </div>

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </DndProvider>
  );
}

export default BoardView;
