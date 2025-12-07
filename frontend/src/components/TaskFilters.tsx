import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFilters } from "../store/taskSlice";

function TaskFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.task);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as typeof filters.status;
    dispatch(setFilters({ status: value }));
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as typeof filters.priority;
    dispatch(setFilters({ priority: value }));
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ dueDate: e.target.value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleClearFilters = () => {
    dispatch(
      setFilters({
        status: "ALL",
        priority: "ALL",
        dueDate: "",
        search: "",
      })
    );
  };

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.dueDate !== "" ||
    filters.search.trim() !== "";

  return (
    <div className="w-full max-w-5xl rounded-lg border border-neutral-800 bg-black p-4 text-white flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
          Filters &amp; Search
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1 w-full md:w-1/4">
          <label
            htmlFor="statusFilter"
            className="text-[11px] font-medium text-neutral-300"
          >
            Filter by status
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={handleStatusChange}
            className="border border-neutral-700 rounded px-3 py-2 text-xs bg-black text-white"
          >
            <option value="ALL">All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-1/4">
          <label
            htmlFor="priorityFilter"
            className="text-[11px] font-medium text-neutral-300"
          >
            Filter by priority
          </label>
          <select
            id="priorityFilter"
            value={filters.priority}
            onChange={handlePriorityChange}
            className="border border-neutral-700 rounded px-3 py-2 text-xs bg-black text-white"
          >
            <option value="ALL">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-1/4">
          <label
            htmlFor="dueDateFilter"
            className="text-[11px] font-medium text-neutral-300"
          >
            Filter by due date
          </label>
          <input
            id="dueDateFilter"
            type="date"
            value={filters.dueDate}
            onChange={handleDueDateChange}
            className="border border-neutral-700 rounded px-3 py-2 text-xs bg-black text-white placeholder-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1 w-full md:w-1/3">
          <label
            htmlFor="taskSearch"
            className="text-[11px] font-medium text-neutral-300"
          >
            Search by title/description
          </label>
          <input
            id="taskSearch"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="border border-neutral-700 rounded px-3 py-2 text-xs bg-black text-white placeholder-neutral-400"
          />
        </div>
      </div>
    </div>
  );
}

export default TaskFilters;


