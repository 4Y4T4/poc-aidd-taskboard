import { useSyncExternalStore } from "react";
import { loadTasks, saveTasks } from "@/lib/storage/taskStorage";
import { createTaskStore } from "@/lib/task/taskStore";
import type { Task, TaskStatus } from "@/lib/task/types";
import type { TaskInput } from "@/lib/task/validation";

// localStorage を外部ストアとして扱い、useSyncExternalStore で購読する。
// - サーバー描画とハイドレーション時は getServerSnapshot の null(未読み込み)を使い、
//   その直後にクライアントの値で再描画されるため、SSR とのハイドレーション不一致が起きない。
// - effect 内で setState する必要がなく、読み込み前の空配列で保存データを上書きする経路もない。
const store = createTaskStore({ load: () => loadTasks(), save: (tasks) => saveTasks(tasks) });

function getServerSnapshot(): null {
  return null;
}

// 未読み込みの間に返す配列。描画のたびに別の参照にならないよう定数にする
const EMPTY_TASKS: Task[] = [];

export type UseTasksResult = {
  tasks: Task[];
  isLoaded: boolean;
  addTask: (input: TaskInput) => void;
  moveTask: (taskId: string, toStatus: TaskStatus) => void;
};

export function useTasks(): UseTasksResult {
  const snapshot = useSyncExternalStore<Task[] | null>(store.subscribe, store.getSnapshot, getServerSnapshot);

  return {
    tasks: snapshot ?? EMPTY_TASKS,
    isLoaded: snapshot !== null,
    addTask: store.addTask,
    moveTask: store.moveTask,
  };
}
