import { useCallback, useSyncExternalStore } from "react";
import { loadTasks, saveTasks } from "@/lib/storage/taskStorage";
import { createTask, moveTask as moveTaskInList } from "@/lib/task/operations";
import type { Task, TaskStatus } from "@/lib/task/types";
import type { TaskInput } from "@/lib/task/validation";

// localStorage を外部ストアとして扱い、useSyncExternalStore で購読する。
// - サーバー描画とハイドレーション時は getServerSnapshot の null(未読み込み)を使い、
//   その直後にクライアントの値で再描画されるため、SSR とのハイドレーション不一致が起きない。
// - effect 内で setState する必要がなく、読み込み前の空配列で保存データを上書きする経路もない。
// - 最新の tasks はこのモジュールが保持するため、操作ハンドラは常に最新の値から次の状態を作れる。
let currentTasks: Task[] | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Task[] {
  // 初回参照時に一度だけ読み込み、以降は同じ参照を返す(毎回別の配列を返すと再描画が止まらない)
  if (currentTasks === null) {
    currentTasks = loadTasks();
  }
  return currentTasks;
}

function getServerSnapshot(): null {
  return null;
}

function commit(next: Task[]): void {
  currentTasks = next;
  saveTasks(next);
  listeners.forEach((listener) => listener());
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
  const snapshot = useSyncExternalStore<Task[] | null>(subscribe, getSnapshot, getServerSnapshot);

  const addTask = useCallback((input: TaskInput) => {
    commit(createTask(getSnapshot(), input));
  }, []);

  const moveTask = useCallback((taskId: string, toStatus: TaskStatus) => {
    const current = getSnapshot();
    const next = moveTaskInList(current, taskId, toStatus);
    // 対象がない・同じ列へのドロップでは lib が同一参照を返すため、保存も再描画もしない
    if (next === current) {
      return;
    }
    commit(next);
  }, []);

  return {
    tasks: snapshot ?? EMPTY_TASKS,
    isLoaded: snapshot !== null,
    addTask,
    moveTask,
  };
}
