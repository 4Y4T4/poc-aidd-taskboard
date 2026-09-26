import { afterEach, describe, expect, it, vi } from "vitest";
import { createTask, moveTask } from "./operations";
import { UUID_V4 } from "./test-patterns";
import type { Task, TaskStatus } from "./types";

function makeTask(id: string, status: TaskStatus): Task {
  return {
    id,
    title: `タスク${id}`,
    description: "",
    status,
    createdAt: "2026-09-24T00:00:00.000Z",
  };
}

describe("createTask", () => {
  const input = { title: "買い物", description: "牛乳を買う" };

  it("初期 status が todo のタスクを作成する", () => {
    const [task] = createTask([], input);
    expect(task.status).toBe("todo");
    expect(task.title).toBe("買い物");
    expect(task.description).toBe("牛乳を買う");
  });

  it("id は UUID v4 形式", () => {
    const [task] = createTask([], input);
    expect(task.id).toMatch(UUID_V4);
  });

  it("配列の末尾に追加する", () => {
    const tasks = [makeTask("a", "todo"), makeTask("b", "done")];
    const result = createTask(tasks, input);
    expect(result).toHaveLength(3);
    expect(result.slice(0, 2)).toEqual(tasks);
    expect(result[2].title).toBe("買い物");
  });

  it("createdAt は渡された日時の ISO 8601 形式", () => {
    const now = new Date("2026-09-26T12:34:56.789Z");
    const [task] = createTask([], input, now);
    expect(task.createdAt).toBe("2026-09-26T12:34:56.789Z");
  });

  describe("日時を省略した場合", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("createdAt は現在時刻の ISO 8601 形式", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-26T01:02:03.456Z"));
      const [task] = createTask([], input);
      expect(task.createdAt).toBe("2026-09-26T01:02:03.456Z");
    });
  });

  it("入力配列を変更しない", () => {
    const tasks = [makeTask("a", "todo")];
    const snapshot = structuredClone(tasks);
    const result = createTask(tasks, input);
    expect(result).not.toBe(tasks);
    expect(tasks).toEqual(snapshot);
  });
});

describe("moveTask", () => {
  const tasks = [
    makeTask("a", "todo"),
    makeTask("b", "in_progress"),
    makeTask("c", "todo"),
    makeTask("d", "done"),
  ];

  it("別の列への移動で status を更新する", () => {
    const result = moveTask(tasks, "a", "done");
    expect(result.find((task) => task.id === "a")?.status).toBe("done");
  });

  it("移動したタスクを配列の末尾(移動先の列の末尾)に配置し、他のタスクの相対順は変えない", () => {
    const result = moveTask(tasks, "a", "done");
    expect(result.map((task) => task.id)).toEqual(["b", "c", "d", "a"]);
    expect(result.filter((task) => task.status === "done").map((task) => task.id)).toEqual(["d", "a"]);
    expect(result.filter((task) => task.status === "todo").map((task) => task.id)).toEqual(["c"]);
  });

  it("移動したタスクの status 以外の項目は変えない", () => {
    const result = moveTask(tasks, "b", "todo");
    expect(result.at(-1)).toEqual({ ...tasks[1], status: "todo" });
  });

  it("同じ列を指定した場合は元の配列をそのまま返す", () => {
    const result = moveTask(tasks, "b", "in_progress");
    expect(result).toBe(tasks);
  });

  it("存在しない id を指定した場合は元の配列をそのまま返す", () => {
    const result = moveTask(tasks, "unknown", "done");
    expect(result).toBe(tasks);
  });

  it("入力配列とタスクを変更しない", () => {
    const snapshot = structuredClone(tasks);
    const result = moveTask(tasks, "a", "in_progress");
    expect(result).not.toBe(tasks);
    expect(tasks).toEqual(snapshot);
  });
});
