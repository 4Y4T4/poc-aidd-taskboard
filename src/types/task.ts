export type TaskStatus = "todo" | "in_progress" | "on_hold" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
};
