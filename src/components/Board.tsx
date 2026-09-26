"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTasks } from "@/hooks/useTasks";
import { COLUMN_ORDER } from "@/lib/task/columns";
import type { TaskInput } from "@/lib/task/validation";
import { AddTaskModal } from "./AddTaskModal";
import { Column } from "./Column";
import { Header } from "./Header";

export function Board() {
  const { tasks, isLoaded, addTask } = useTasks();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  function closeAddModal() {
    // inert が外れてからでないとボタンにフォーカスできないため、閉じた状態を先に DOM へ反映する
    flushSync(() => setIsAddModalOpen(false));
    addButtonRef.current?.focus();
  }

  function handleAdd(input: TaskInput) {
    addTask(input);
    closeAddModal();
  }

  return (
    <>
      <div inert={isAddModalOpen} className="flex flex-1 flex-col">
        <Header onAddClick={() => setIsAddModalOpen(true)} addButtonRef={addButtonRef} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMN_ORDER.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                isLoaded={isLoaded}
              />
            ))}
          </div>
        </main>
      </div>
      {isAddModalOpen && <AddTaskModal onAdd={handleAdd} onClose={closeAddModal} />}
    </>
  );
}
