import { PRIORITY_LABELS } from "@/lib/task/priorities";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
};

// Date で解釈すると UTC として読まれ、タイムゾーンによって前日の日付で表示されるため、文字列のまま変換する
function formatDueDate(dueDate: string): string {
  return dueDate.replaceAll("-", "/");
}

export function TaskCard({ task }: TaskCardProps) {
  const attributes: { key: string; text: string }[] = [];
  if (task.priority !== undefined) {
    attributes.push({ key: "priority", text: `優先度: ${PRIORITY_LABELS[task.priority]}` });
  }
  if (task.assignee !== undefined) {
    attributes.push({ key: "assignee", text: `担当: ${task.assignee}` });
  }
  if (task.dueDate !== undefined) {
    attributes.push({ key: "dueDate", text: `期限: ${formatDueDate(task.dueDate)}` });
  }

  return (
    <article className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 wrap-anywhere">{task.title}</h3>
      {attributes.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
          {attributes.map((attribute) => (
            <li key={attribute.key} className="min-w-0 wrap-anywhere">
              {attribute.text}
            </li>
          ))}
        </ul>
      )}
      {task.description !== "" && (
        <p className="mt-1 line-clamp-3 text-sm whitespace-pre-wrap text-gray-600 wrap-anywhere">
          {task.description}
        </p>
      )}
    </article>
  );
}
