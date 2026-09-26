import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import type { Task } from "@/lib/task/types";
import { DESCRIPTION_MAX, TITLE_MAX } from "@/lib/task/validation";
import { loadTasks, saveTasks } from "./taskStorage";

const KEY = "taskboard:tasks";

function createStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => Array.from(map.keys())[index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, String(value));
    },
  };
}

function storageWith(data: unknown): Storage {
  return createStorage({ [KEY]: JSON.stringify(data) });
}

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `タスク${id}`,
    description: "",
    status: "todo",
    createdAt: "2026-09-24T00:00:00.000Z",
    ...overrides,
  };
}

describe("taskStorage", () => {
  let warn: MockInstance<typeof console.warn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadTasks", () => {
    it("データがなければ空配列を返し、警告しない", () => {
      expect(loadTasks(createStorage())).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
    });

    it("有効なタスクを配列の順序のまま復元する", () => {
      const tasks = [
        makeTask("a", { status: "done", description: "説明" }),
        makeTask("b", { status: "in_progress" }),
        makeTask("c"),
      ];
      expect(loadTasks(storageWith({ version: 1, tasks }))).toEqual(tasks);
      expect(warn).not.toHaveBeenCalled();
    });

    describe("データ全体が不正", () => {
      it.each([
        ["JSON として読めない", "{not json"],
        ["version が 1 でない", JSON.stringify({ version: 2, tasks: [makeTask("a")] })],
        ["version がない", JSON.stringify({ tasks: [makeTask("a")] })],
        ["tasks が配列でない", JSON.stringify({ version: 1, tasks: { 0: makeTask("a") } })],
        ["tasks がない", JSON.stringify({ version: 1 })],
        ["ルートが null", "null"],
        ["ルートが配列", JSON.stringify([makeTask("a")])],
        ["ルートが文字列", JSON.stringify("tasks")],
      ])("%sなら空配列を返し、警告を1回出す", (_, raw) => {
        expect(loadTasks(createStorage({ [KEY]: raw }))).toEqual([]);
        expect(warn).toHaveBeenCalledTimes(1);
      });
    });

    describe("一部のタスクだけが不正", () => {
      it.each([
        ["タスクが null", null],
        ["タスクが文字列", "task"],
        ["id がない", { ...makeTask("x"), id: undefined }],
        ["id が空文字", makeTask("")],
        ["id が数値", { ...makeTask("x"), id: 1 }],
        ["title が文字列でない", { ...makeTask("x"), title: 1 }],
        ["title が空文字", makeTask("x", { title: "" })],
        ["title が空白のみ", makeTask("x", { title: " \t\n　" })],
        ["title が51文字", makeTask("x", { title: "あ".repeat(TITLE_MAX + 1) })],
        ["description がない", { ...makeTask("x"), description: undefined }],
        ["description が文字列でない", { ...makeTask("x"), description: null }],
        ["description が501文字", makeTask("x", { description: "あ".repeat(DESCRIPTION_MAX + 1) })],
        ["status が未定義の値", { ...makeTask("x"), status: "archived" }],
        ["status がない", { ...makeTask("x"), status: undefined }],
        ["createdAt が文字列でない", { ...makeTask("x"), createdAt: 1758672000000 }],
        ["createdAt が日時として解釈できない", makeTask("x", { createdAt: "abc" })],
        ["createdAt が ISO 8601 の往復で一致しない", makeTask("x", { createdAt: "2026-09-24" })],
        ["createdAt が存在しない日付", makeTask("x", { createdAt: "2026-02-30T00:00:00.000Z" })],
      ])("%sのタスクを除外し、除外件数を警告する", (_, invalid) => {
        const valid = [makeTask("a"), makeTask("b")];
        const result = loadTasks(storageWith({ version: 1, tasks: [valid[0], invalid, valid[1]] }));
        expect(result).toEqual(valid);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("1件");
      });

      it.each([
        ["title が1文字", { title: "a" }],
        ["title が50文字", { title: "あ".repeat(TITLE_MAX) }],
        ["title が前後の空白を除いて50文字", { title: ` ${"あ".repeat(TITLE_MAX)}\n` }],
        ["title がZWJ結合絵文字50個", { title: "👨‍👩‍👧".repeat(TITLE_MAX) }],
        ["description が空文字", { description: "" }],
        ["description が500文字", { description: "あ".repeat(DESCRIPTION_MAX) }],
        ["description が前後の空白を除いて500文字", { description: `\n${"あ".repeat(DESCRIPTION_MAX)} ` }],
      ])("%sのタスクは有効", (_, overrides) => {
        const task = makeTask("a", overrides);
        expect(loadTasks(storageWith({ version: 1, tasks: [task] }))).toEqual([task]);
        expect(warn).not.toHaveBeenCalled();
      });

      it("createdAt が abc のタスクは例外を出さずに除外する", () => {
        const storage = storageWith({ version: 1, tasks: [makeTask("a", { createdAt: "abc" })] });
        expect(() => loadTasks(storage)).not.toThrow();
        expect(loadTasks(storage)).toEqual([]);
      });

      it("複数の不正なタスクを除外した場合は合計件数を1回だけ警告する", () => {
        const tasks = [makeTask(""), makeTask("a"), makeTask("b", { status: "x" as Task["status"] }), null];
        expect(loadTasks(storageWith({ version: 1, tasks }))).toEqual([makeTask("a")]);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("3件");
      });

      it("Task の5項目以外のプロパティは持ち込まない", () => {
        const task = makeTask("a");
        const result = loadTasks(storageWith({ version: 1, tasks: [{ ...task, priority: "high" }] }));
        expect(result).toEqual([task]);
        expect(Object.keys(result[0]).sort()).toEqual(
          ["createdAt", "description", "id", "status", "title"],
        );
      });
    });

    it("すべてのタスクが不正なら空配列を返し、除外件数を警告する", () => {
      const tasks = [makeTask(""), makeTask("a", { title: "" }), makeTask("b", { createdAt: "abc" })];
      expect(loadTasks(storageWith({ version: 1, tasks }))).toEqual([]);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain("3件");
    });

    it("id が重複している場合は先頭に近いタスクを残し、後続を除外件数に含める", () => {
      const first = makeTask("a", { title: "先頭" });
      const tasks = [first, makeTask("b"), makeTask("a", { title: "後続1" }), makeTask("a", { title: "後続2" })];
      expect(loadTasks(storageWith({ version: 1, tasks }))).toEqual([first, makeTask("b")]);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain("2件");
    });

    it("不正なタスクと同じ id を持つ後続の有効なタスクは残す", () => {
      const valid = makeTask("a", { title: "有効" });
      const tasks = [makeTask("a", { title: "" }), valid];
      expect(loadTasks(storageWith({ version: 1, tasks }))).toEqual([valid]);
      expect(warn.mock.calls[0][0]).toContain("1件");
    });

    it("getItem が例外を投げても例外を出さずに空配列を返し、警告を1回出す", () => {
      const storage = createStorage();
      storage.getItem = () => {
        throw new Error("SecurityError");
      };
      expect(loadTasks(storage)).toEqual([]);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe("saveTasks", () => {
    it("キー taskboard:tasks に version 1 の形式で保存する", () => {
      const storage = createStorage();
      const tasks = [makeTask("a")];
      saveTasks(tasks, storage);
      expect(JSON.parse(storage.getItem(KEY) ?? "")).toEqual({ version: 1, tasks });
      expect(warn).not.toHaveBeenCalled();
    });

    it("setItem が例外を投げても例外を出さず、警告を1回出す", () => {
      const storage = createStorage();
      storage.setItem = () => {
        throw new Error("QuotaExceededError");
      };
      expect(() => saveTasks([makeTask("a")], storage)).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("保存したタスクを読み込むと元のタスクに戻る", () => {
      const storage = createStorage();
      const tasks = [
        makeTask("a", { title: "買い物", description: "牛乳\n卵" }),
        makeTask("b", { status: "in_progress", title: "👨‍👩‍👧🇯🇵" }),
        makeTask("c", { status: "done", createdAt: "2026-09-26T12:34:56.789Z" }),
      ];
      saveTasks(tasks, storage);
      expect(loadTasks(storage)).toEqual(tasks);
      expect(warn).not.toHaveBeenCalled();
    });

    it("空配列を保存すると読み込み結果も空配列になる", () => {
      const storage = createStorage({ [KEY]: JSON.stringify({ version: 1, tasks: [makeTask("a")] }) });
      saveTasks([], storage);
      expect(loadTasks(storage)).toEqual([]);
    });
  });

  describe("Storage を省略した場合", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

    afterEach(() => {
      if (original === undefined) {
        Reflect.deleteProperty(globalThis, "localStorage");
      } else {
        Object.defineProperty(globalThis, "localStorage", original);
      }
    });

    it("localStorage を使って保存・読み込みする", () => {
      const storage = createStorage();
      Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
      const tasks = [makeTask("a")];
      saveTasks(tasks);
      expect(storage.getItem(KEY)).not.toBeNull();
      expect(loadTasks()).toEqual(tasks);
    });

    it("localStorage が未定義の環境でも例外を出さない", () => {
      Reflect.deleteProperty(globalThis, "localStorage");
      expect(loadTasks()).toEqual([]);
      expect(() => saveTasks([makeTask("a")])).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it("localStorage の参照自体が例外を投げる環境でも例外を出さない", () => {
      Object.defineProperty(globalThis, "localStorage", {
        get() {
          throw new Error("SecurityError");
        },
        configurable: true,
      });
      expect(loadTasks()).toEqual([]);
      expect(() => saveTasks([makeTask("a")])).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(2);
    });
  });
});
