import type { TaskPriority } from "@/types/task";

export const PRIORITY_ORDER: readonly TaskPriority[] = ["high", "medium", "low"];

export const PRIORITY_LABELS: Readonly<Record<TaskPriority, string>> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function isTaskPriority(value: unknown): value is TaskPriority {
  return (PRIORITY_ORDER as readonly unknown[]).includes(value);
}
