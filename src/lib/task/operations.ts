import type { Task, TaskStatus } from "@/types/task";
import { generateId } from "./id";
import type { ValidTaskInput } from "./validation";

export function createTask(tasks: Task[], input: ValidTaskInput, now: Date = new Date()): Task[] {
  const task: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    status: "todo",
    createdAt: now.toISOString(),
  };
  if (input.assignee !== undefined) {
    task.assignee = input.assignee;
  }
  if (input.priority !== undefined) {
    task.priority = input.priority;
  }
  if (input.dueDate !== undefined) {
    task.dueDate = input.dueDate;
  }
  return [...tasks, task];
}

export function moveTask(tasks: Task[], taskId: string, toStatus: TaskStatus): Task[] {
  const target = tasks.find((task) => task.id === taskId);
  if (target === undefined || target.status === toStatus) {
    return tasks;
  }
  return [...tasks.filter((task) => task.id !== taskId), { ...target, status: toStatus }];
}
