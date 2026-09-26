"use client";

import { useTasks } from "@/hooks/useTasks";
import { COLUMN_ORDER } from "@/lib/task/columns";
import { Column } from "./Column";
import { Header } from "./Header";

export function Board() {
  const { tasks, isLoaded } = useTasks();

  return (
    <>
      <Header />
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
    </>
  );
}
