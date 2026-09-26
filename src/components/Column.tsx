import { useDroppable } from "@dnd-kit/core";
import { COLUMN_LABELS } from "@/lib/task/columns";
import type { Task, TaskStatus } from "@/lib/task/types";
import { DraggableTaskCard } from "./DraggableTaskCard";

type ColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  isLoaded: boolean;
};

export function Column({ status, tasks, isLoaded }: ColumnProps) {
  const headingId = `column-heading-${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      aria-busy={!isLoaded}
      data-over={isOver || undefined}
      className="flex min-h-48 min-w-0 flex-col rounded-lg bg-gray-100 p-3 transition-colors data-over:bg-blue-50 data-over:ring-2 data-over:ring-blue-400"
    >
      <h2 id={headingId} className="mb-3 px-1 text-sm font-bold text-gray-700">
        {COLUMN_LABELS[status]}
        {isLoaded && ` (${tasks.length})`}
      </h2>
      {isLoaded &&
        (tasks.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-gray-500">
            タスクはありません
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li key={task.id}>
                <DraggableTaskCard task={task} />
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}
