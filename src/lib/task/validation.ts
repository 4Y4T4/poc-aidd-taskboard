import type { Task } from "@/types/task";
import { isTaskPriority } from "./priorities";

export const TITLE_MAX = 50;
export const DESCRIPTION_MAX = 500;
export const ASSIGNEE_MAX = 20;

// フォームの入力値をそのまま渡せる形。担当者・優先度・期限の未設定は空文字で表す
export type TaskInput = {
  title: string;
  description: string;
  assignee: string;
  priority: string;
  dueDate: string;
};

// 検証を通過した値。未設定の付加属性は項目自体を持たない(保存データにも出さないため)
export type ValidTaskInput = Pick<Task, "title" | "description" | "assignee" | "priority" | "dueDate">;

export type TaskInputErrors = Partial<Record<keyof TaskInput, string>>;

export type TaskInputValidationResult =
  | { ok: true; value: ValidTaskInput }
  | { ok: false; errors: TaskInputErrors };

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function countGraphemes(str: string): number {
  return Array.from(graphemeSegmenter.segment(str)).length;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// Date で解釈すると実行環境のタイムゾーンや日付の繰り上げ(2/30 → 3/2)に左右されるため、暦の計算だけで判定する
export function isValidDueDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (match === null) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) {
    return false;
  }
  return day >= 1 && day <= daysInMonth(year, month);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeapYear ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function validateTaskInput(input: TaskInput): TaskInputValidationResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const assignee = input.assignee.trim();
  const priority = input.priority.trim();
  const dueDate = input.dueDate.trim();
  const errors: TaskInputErrors = {};

  if (title === "") {
    errors.title = "タイトルを入力してください";
  } else if (countGraphemes(title) > TITLE_MAX) {
    errors.title = `タイトルは${TITLE_MAX}文字以内で入力してください`;
  }

  if (countGraphemes(description) > DESCRIPTION_MAX) {
    errors.description = `説明は${DESCRIPTION_MAX}文字以内で入力してください`;
  }

  if (countGraphemes(assignee) > ASSIGNEE_MAX) {
    errors.assignee = `担当者は${ASSIGNEE_MAX}文字以内で入力してください`;
  }

  if (priority !== "" && !isTaskPriority(priority)) {
    errors.priority = "優先度を選択肢から選んでください";
  }

  if (dueDate !== "" && !isValidDueDate(dueDate)) {
    errors.dueDate = "期限の日付が正しくありません";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const value: ValidTaskInput = { title, description };
  if (assignee !== "") {
    value.assignee = assignee;
  }
  if (isTaskPriority(priority)) {
    value.priority = priority;
  }
  if (dueDate !== "") {
    value.dueDate = dueDate;
  }
  return { ok: true, value };
}
