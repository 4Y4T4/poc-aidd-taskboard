import type { TaskStatus } from "./types";

export const COLUMN_ORDER: readonly TaskStatus[] = ["todo", "in_progress", "on_hold", "done"];

export const COLUMN_LABELS: Readonly<Record<TaskStatus, string>> = {
  todo: "未着手",
  in_progress: "進行中",
  on_hold: "保留",
  done: "完了",
};
