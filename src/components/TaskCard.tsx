import type { Task } from "@/lib/task/types";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 wrap-anywhere">{task.title}</h3>
      {task.description !== "" && (
        <p className="mt-1 line-clamp-3 text-sm whitespace-pre-wrap text-gray-600 wrap-anywhere">
          {task.description}
        </p>
      )}
    </article>
  );
}
