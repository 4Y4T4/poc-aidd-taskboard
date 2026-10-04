import type { Active, UniqueIdentifier } from "@dnd-kit/core";
import { COLUMN_ORDER } from "@/lib/task/columns";
import type { Task, TaskStatus } from "@/types/task";

export type TaskDragData = {
  task: Task;
};

export function getDraggedTask(active: Active): Task | undefined {
  return (active.data.current as TaskDragData | undefined)?.task;
}

// 列の droppable の id には status を使っている
export function isTaskStatus(id: UniqueIdentifier): id is TaskStatus {
  return (COLUMN_ORDER as readonly UniqueIdentifier[]).includes(id);
}
