import { useDraggable } from "@dnd-kit/core";
import { useId } from "react";
import type { Task } from "@/types/task";
import type { TaskDragData } from "./dnd/taskDragData";
import { TaskCard } from "./TaskCard";

type DraggableTaskCardProps = {
  task: Task;
};

export function DraggableTaskCard({ task }: DraggableTaskCardProps) {
  const data: TaskDragData = { task };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data,
    attributes: { roleDescription: "ドラッグできるタスク" },
  });
  const attributesId = useId();
  const hasAttributes = task.priority !== undefined || task.assignee !== undefined || task.dueDate !== undefined;
  // ボタンの中身は読み上げられないため、付加属性の行を説明として参照する。dnd-kit の操作説明は消さずに後ろへ残す
  const describedBy = hasAttributes
    ? `${attributesId} ${attributes["aria-describedby"]}`
    : attributes["aria-describedby"];

  // ドラッグ中はポインタに追従するカードを DragOverlay で表示するため、元のカードは動かさず半透明にするだけにする。
  // 長押しでドラッグを始めるタッチ操作で、文字選択や iOS の長押しメニューが出ないようにする
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // 中身の article の文字はボタンの名前に使われず空になるため明示する。説明は最大500文字あるのでタイトルだけにする
      aria-label={task.title}
      aria-describedby={describedBy}
      data-dragging={isDragging || undefined}
      className="cursor-grab touch-manipulation rounded-md select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-dragging:opacity-50"
    >
      <TaskCard task={task} attributesId={attributesId} />
    </div>
  );
}
