import { COLUMN_ORDER } from "@/lib/task/columns";
import { isTaskPriority } from "@/lib/task/priorities";
import { isValidDueDate, validateTaskInput } from "@/lib/task/validation";
import type { Task, TaskStatus } from "@/types/task";

const STORAGE_KEY = "taskboard:tasks";
const STORAGE_VERSION = 1;

export function loadTasks(storage?: Storage): Task[] {
  let raw: string | null;
  try {
    // localStorage は参照しただけで例外になる環境(アクセス拒否・サーバー側で未定義)があるため try の内側で解決する
    raw = (storage ?? localStorage).getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("保存データを読み込めませんでした", error);
    return [];
  }
  if (raw === null) {
    return [];
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.warn("保存データが JSON として読めないため破棄します", error);
    return [];
  }
  if (!isRecord(data) || data.version !== STORAGE_VERSION || !Array.isArray(data.tasks)) {
    console.warn("保存データの形式が不正なため破棄します");
    return [];
  }

  const ids = new Set<string>();
  const tasks: Task[] = [];
  for (const item of data.tasks) {
    const task = parseTask(item);
    if (task === null || ids.has(task.id)) {
      continue;
    }
    ids.add(task.id);
    tasks.push(task);
  }

  const excluded = data.tasks.length - tasks.length;
  if (excluded > 0) {
    console.warn(`保存データ内の不正なタスク${excluded}件を除外しました`);
  }
  return tasks;
}

export function saveTasks(tasks: Task[], storage?: Storage): void {
  try {
    (storage ?? localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, tasks }),
    );
  } catch (error) {
    console.warn("タスクを保存できませんでした", error);
  }
}

function parseTask(value: unknown): Task | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, title, description, status, createdAt, assignee, priority, dueDate } = value;
  if (typeof id !== "string" || id === "") {
    return null;
  }
  if (typeof title !== "string" || typeof description !== "string") {
    return null;
  }
  // フォームでは空文字が「未設定」を表すが、保存データでは未設定の項目を出さないため、空の値を持つタスクは不正とする
  if (assignee !== undefined && (typeof assignee !== "string" || assignee.trim() === "")) {
    return null;
  }
  if (priority !== undefined && !isTaskPriority(priority)) {
    return null;
  }
  if (dueDate !== undefined && (typeof dueDate !== "string" || !isValidDueDate(dueDate))) {
    return null;
  }
  const input = { title, description, assignee: assignee ?? "", priority: priority ?? "", dueDate: dueDate ?? "" };
  if (!validateTaskInput(input).ok) {
    return null;
  }
  if (!isTaskStatus(status)) {
    return null;
  }
  if (typeof createdAt !== "string" || !isIsoDateString(createdAt)) {
    return null;
  }
  const task: Task = { id, title, description, status, createdAt };
  if (assignee !== undefined) {
    task.assignee = assignee;
  }
  if (priority !== undefined) {
    task.priority = priority;
  }
  if (dueDate !== undefined) {
    task.dueDate = dueDate;
  }
  return task;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return (COLUMN_ORDER as readonly unknown[]).includes(value);
}

function isIsoDateString(value: string): boolean {
  const date = new Date(value);
  // 不正な日時に toISOString を呼ぶと RangeError になるため先に NaN を除外する
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}
