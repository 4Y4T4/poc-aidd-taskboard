"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTasks } from "@/hooks/useTasks";
import { COLUMN_ORDER } from "@/lib/task/columns";
import type { TaskInput } from "@/lib/task/validation";
import type { Task } from "@/types/task";
import { AddTaskModal } from "./AddTaskModal";
import { Column } from "./Column";
import { announcements, screenReaderInstructions } from "./dnd/accessibility";
import { columnCollisionDetection } from "./dnd/collisionDetection";
import { columnKeyboardCoordinates } from "./dnd/keyboardCoordinates";
import { getDraggedTask, isTaskStatus } from "./dnd/taskDragData";
import { Header } from "./Header";
import { TaskCard } from "./TaskCard";

const accessibility = { announcements, screenReaderInstructions };

export function Board() {
  const { tasks, isLoaded, addTask, moveTask } = useTasks();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  function closeAddModal() {
    // inert が外れてからでないとボタンにフォーカスできないため、閉じた状態を先に DOM へ反映する
    flushSync(() => setIsAddModalOpen(false));
    addButtonRef.current?.focus();
  }

  function handleAdd(input: TaskInput) {
    addTask(input);
    closeAddModal();
  }

  function handleDragStart({ active }: DragStartEvent) {
    setDraggingTask(getDraggedTask(active) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingTask(null);
    const task = getDraggedTask(active);
    if (task === undefined || over === null || !isTaskStatus(over.id)) {
      return;
    }
    // 同じ列へのドロップでは moveTask が何も変更・保存しない
    moveTask(task.id, over.id);
  }

  return (
    <>
      <div inert={isAddModalOpen} className="flex flex-1 flex-col">
        <Header onAddClick={() => setIsAddModalOpen(true)} addButtonRef={addButtonRef} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {/* id を固定しないと、dnd-kit が採番する aria-describedby の id が SSR とクライアントで食い違う */}
          <DndContext
            id="task-board-dnd"
            sensors={sensors}
            collisionDetection={columnCollisionDetection}
            accessibility={accessibility}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggingTask(null)}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {COLUMN_ORDER.map((status) => (
                <Column
                  key={status}
                  status={status}
                  tasks={tasks.filter((task) => task.status === status)}
                  isLoaded={isLoaded}
                />
              ))}
            </div>
            <DragOverlay>
              {draggingTask !== null && (
                <div className="cursor-grabbing rounded-md shadow-lg">
                  <TaskCard task={draggingTask} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
      {isAddModalOpen && <AddTaskModal onAdd={handleAdd} onClose={closeAddModal} />}
    </>
  );
}
