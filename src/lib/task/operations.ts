import { generateId } from "./id";
import type { Task, TaskStatus } from "./types";
import type { TaskInput } from "./validation";

export function createTask(tasks: Task[], input: TaskInput, now: Date = new Date()): Task[] {
  const task: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    status: "todo",
    createdAt: now.toISOString(),
  };
  return [...tasks, task];
}

export function moveTask(tasks: Task[], taskId: string, toStatus: TaskStatus): Task[] {
  const target = tasks.find((task) => task.id === taskId);
  if (target === undefined || target.status === toStatus) {
    return tasks;
  }
  return [...tasks.filter((task) => task.id !== taskId), { ...target, status: toStatus }];
}
