import { createTask, moveTask as moveTaskInList } from "./operations";
import type { Task, TaskStatus } from "./types";
import type { TaskInput } from "./validation";

export type TaskStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => Task[];
  addTask: (input: TaskInput) => void;
  moveTask: (taskId: string, toStatus: TaskStatus) => void;
};

type TaskStoreDeps = {
  load: () => Task[];
  save: (tasks: Task[]) => void;
};

export function createTaskStore({ load, save }: TaskStoreDeps): TaskStore {
  let currentTasks: Task[] | null = null;
  const listeners = new Set<() => void>();

  function getSnapshot(): Task[] {
    // 初回参照時に一度だけ読み込み、以降は同じ参照を返す(毎回別の配列を返すと useSyncExternalStore の再描画が止まらない)
    if (currentTasks === null) {
      currentTasks = load();
    }
    return currentTasks;
  }

  function commit(next: Task[]): void {
    currentTasks = next;
    save(next);
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    addTask(input) {
      commit(createTask(getSnapshot(), input));
    },
    moveTask(taskId, toStatus) {
      const current = getSnapshot();
      const next = moveTaskInList(current, taskId, toStatus);
      // 対象がない・同じ列へのドロップでは同一参照が返るため、保存も再描画もしない
      if (next === current) {
        return;
      }
      commit(next);
    },
  };
}
