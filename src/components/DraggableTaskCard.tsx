import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/lib/task/types";
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

  // ドラッグ中はポインタに追従するカードを DragOverlay で表示するため、元のカードは動かさず半透明にするだけにする。
  // 長押しでドラッグを始めるタッチ操作で、文字選択や iOS の長押しメニューが出ないようにする
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-dragging={isDragging || undefined}
      className="cursor-grab touch-manipulation rounded-md select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-dragging:opacity-50"
    >
      <TaskCard task={task} />
    </div>
  );
}
