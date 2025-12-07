import { useEffect, useState } from "react";
import TaskCard, { type TaskCardProps } from "./TaskCard";
import TaskEditModal from "./TaskEditModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAllTasks } from "../apis/taskApi";
import type { Task } from "../store/taskSlice";

function ListView() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, filters } = useAppSelector((state) => state.task);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const normalizedSearch = filters.search.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
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

  const taskCards: TaskCardProps[] = filteredTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date || undefined,
  }));

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl rounded-lg border border-neutral-800 bg-black p-4 text-white">
        <h2 className="mb-3 text-sm font-semibold text-neutral-100">Tasks</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-neutral-400">Loading tasks...</p>
          </div>
        ) : taskCards.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-neutral-400">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {taskCards.map((task) => (
              <TaskCard 
                key={task.id} 
                {...task} 
                onClick={() => handleTaskClick(task.id)}
              />
            ))}
          </div>
        )}
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
    </>
  );
}

export default ListView;
