import type { Active, Announcements, Over, ScreenReaderInstructions } from "@dnd-kit/core";
import { COLUMN_LABELS } from "@/lib/task/columns";
import { getDraggedTask, isTaskStatus } from "./taskDragData";

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "スペースキーまたはEnterキーでタスクを持ち上げます。持ち上げた後は矢印キーで隣の列へ移動し、スペースキーまたはEnterキーで移動を確定、Escキーでキャンセルします。",
};

function taskLabel(active: Active): string {
  const task = getDraggedTask(active);
  return task !== undefined ? `タスク「${task.title}」` : "タスク";
}

function columnLabel(over: Over): string | undefined {
  return isTaskStatus(over.id) ? COLUMN_LABELS[over.id] : undefined;
}

function originLabel(active: Active): string | undefined {
  const task = getDraggedTask(active);
  return task !== undefined ? COLUMN_LABELS[task.status] : undefined;
}

export const announcements: Announcements = {
  onDragStart({ active }) {
    const origin = originLabel(active);
    return origin !== undefined
      ? `${taskLabel(active)}を持ち上げました。現在の列は「${origin}」です。`
      : `${taskLabel(active)}を持ち上げました。`;
  },
  onDragOver({ active, over }) {
    const label = over !== null ? columnLabel(over) : undefined;
    return label !== undefined
      ? `${taskLabel(active)}は「${label}」列の上にあります。`
      : `${taskLabel(active)}は列の上にありません。`;
  },
  onDragEnd({ active, over }) {
    const label = over !== null ? columnLabel(over) : undefined;
    if (label === undefined) {
      return `列の外でドロップしたため、${taskLabel(active)}は移動しませんでした。`;
    }
    if (label === originLabel(active)) {
      return `${taskLabel(active)}を「${label}」列に戻しました。`;
    }
    return `${taskLabel(active)}を「${label}」列に移動しました。`;
  },
  onDragCancel({ active }) {
    const origin = originLabel(active);
    return origin !== undefined
      ? `移動をキャンセルしました。${taskLabel(active)}は「${origin}」列に戻りました。`
      : "移動をキャンセルしました。";
  },
};
