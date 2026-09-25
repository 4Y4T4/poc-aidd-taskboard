import type { TaskStatus } from "./types";

export const COLUMN_ORDER: readonly TaskStatus[] = ["todo", "in_progress", "done"];

export const COLUMN_LABELS: Readonly<Record<TaskStatus, string>> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};
