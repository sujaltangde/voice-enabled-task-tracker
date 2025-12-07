export type StatusKey = "TODO" | "IN_PROGRESS" | "DONE";
export type PriorityKey = "LOW" | "MEDIUM" | "HIGH";

export type TaskCardProps = {
  id: string;
  title: string;
  description?: string;
  status: StatusKey;
  priority: PriorityKey;
  dueDate?: string;
  onClick?: () => void;
};

const STATUS_LABELS: Record<StatusKey, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PRIORITY_LABELS: Record<PriorityKey, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_STYLES: Record<PriorityKey, string> = {
  LOW: "border-neutral-600 text-neutral-300",
  MEDIUM: "border-amber-500 text-amber-400",
  HIGH: "border-red-500 text-red-400",
};

function formatDateForDisplay(date?: string) {
  if (!date) return "";
  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function TaskCard({ id: _id, title, description, status, priority, dueDate, onClick }: TaskCardProps) {
  const priorityStyle = PRIORITY_STYLES[priority];
  const formattedDate = formatDateForDisplay(dueDate);

  return (
    <div 
      className="w-full cursor-pointer rounded-lg border border-neutral-800 bg-black px-4 py-3 text-white shadow-sm transition-all hover:border-neutral-700 hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
        <span
          className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${priorityStyle}`}
        >
          {PRIORITY_LABELS[priority]}
        </span>
      </div>

      {description && (
        <p className="mb-3 text-xs text-neutral-300 line-clamp-3">{description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-neutral-400">
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide">
          {STATUS_LABELS[status]}
        </span>
        {formattedDate && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Due {formattedDate}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
