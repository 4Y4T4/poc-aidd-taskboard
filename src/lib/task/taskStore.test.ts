import { describe, expect, it, vi } from "vitest";
import { createTaskStore } from "./taskStore";
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

function setup(initial: Task[] = []) {
  const load = vi.fn(() => initial);
  const save = vi.fn<(tasks: Task[]) => void>();
  const store = createTaskStore({ load, save });
  const listener = vi.fn();
  store.subscribe(listener);
  return { store, load, save, listener };
}

describe("createTaskStore", () => {
  describe("getSnapshot", () => {
    it("初回参照時に一度だけ読み込み、以降は同じ参照を返す", () => {
      const initial = [makeTask("a", "todo")];
      const { store, load } = setup(initial);
      expect(load).not.toHaveBeenCalled();
      expect(store.getSnapshot()).toBe(initial);
      expect(store.getSnapshot()).toBe(initial);
      expect(load).toHaveBeenCalledTimes(1);
    });
  });

  describe("addTask", () => {
    it("読み込み済みのタスクの末尾に追加し、保存と通知を1回ずつ行う", () => {
      const { store, save, listener } = setup([makeTask("a", "done")]);
      store.addTask({ title: "買い物", description: "牛乳を買う" });

      const tasks = store.getSnapshot();
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toEqual(makeTask("a", "done"));
      expect(tasks[1]).toMatchObject({ title: "買い物", description: "牛乳を買う", status: "todo" });
      expect(save).toHaveBeenCalledTimes(1);
      expect(save).toHaveBeenCalledWith(tasks);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("getSnapshot より先に呼ばれても、読み込んだデータを捨てずに追加する", () => {
      const { store, load, save } = setup([makeTask("a", "todo")]);
      store.addTask({ title: "買い物", description: "" });
      expect(load).toHaveBeenCalledTimes(1);
      const [saved] = save.mock.calls[0];
      expect(saved).toHaveLength(2);
      expect(saved[0]).toEqual(makeTask("a", "todo"));
    });
  });

  describe("moveTask", () => {
    it("別の列への移動では移動後のタスクを保存し、通知を1回行う", () => {
      const { store, save, listener } = setup([makeTask("a", "todo"), makeTask("b", "todo")]);
      store.moveTask("a", "done");

      const expected = [makeTask("b", "todo"), makeTask("a", "done")];
      expect(store.getSnapshot()).toEqual(expected);
      expect(save).toHaveBeenCalledTimes(1);
      expect(save).toHaveBeenCalledWith(expected);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("同じ列への移動では保存も通知もせず、同じ参照を保つ", () => {
      const initial = [makeTask("a", "todo")];
      const { store, save, listener } = setup(initial);
      store.moveTask("a", "todo");
      expect(store.getSnapshot()).toBe(initial);
      expect(save).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    });

    it("存在しない id の移動では保存も通知もせず、同じ参照を保つ", () => {
      const initial = [makeTask("a", "todo")];
      const { store, save, listener } = setup(initial);
      store.moveTask("unknown", "done");
      expect(store.getSnapshot()).toBe(initial);
      expect(save).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    it("購読を解除したリスナーには通知しない", () => {
      const { store } = setup();
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      store.addTask({ title: "買い物", description: "" });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
