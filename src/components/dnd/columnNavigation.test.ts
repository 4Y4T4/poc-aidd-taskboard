import { describe, expect, it } from "vitest";
import {
  findAdjacentColumn,
  getArrowDirection,
  getCoordinatesInColumn,
  isHorizontalLayout,
  type ArrowDirection,
  type ColumnRect,
} from "./columnNavigation";

// md 以上: 3列を横に等幅で並べる(列の高さはそろう)
const horizontalColumns: ColumnRect<string>[] = [
  { id: "todo", rect: { left: 16, top: 80, width: 300, height: 400 } },
  { id: "in_progress", rect: { left: 332, top: 80, width: 300, height: 400 } },
  { id: "done", rect: { left: 648, top: 80, width: 300, height: 400 } },
];

// md 未満: 3列を縦に積む(列の高さはタスク数で異なる)
const verticalColumns: ColumnRect<string>[] = [
  { id: "todo", rect: { left: 16, top: 80, width: 340, height: 500 } },
  { id: "in_progress", rect: { left: 16, top: 596, width: 340, height: 192 } },
  { id: "done", rect: { left: 16, top: 804, width: 340, height: 192 } },
];

describe("getArrowDirection", () => {
  it.each([
    ["ArrowLeft", "left"],
    ["ArrowRight", "right"],
    ["ArrowUp", "up"],
    ["ArrowDown", "down"],
  ])("%s は %s を返す", (code, expected) => {
    expect(getArrowDirection(code)).toBe(expected);
  });

  it.each(["Space", "Enter", "Escape", "Tab", "KeyA"])("矢印キー以外(%s)は null を返す", (code) => {
    expect(getArrowDirection(code)).toBeNull();
  });
});

describe("isHorizontalLayout", () => {
  it("横並びの列を横並びと判定する", () => {
    expect(isHorizontalLayout(horizontalColumns.map((c) => c.rect))).toBe(true);
  });

  it("縦積みの列を縦積みと判定する", () => {
    expect(isHorizontalLayout(verticalColumns.map((c) => c.rect))).toBe(false);
  });
});

describe("findAdjacentColumn", () => {
  describe("横並び", () => {
    it.each<[string, ArrowDirection, string]>([
      ["todo", "right", "in_progress"],
      ["in_progress", "right", "done"],
      ["done", "left", "in_progress"],
      ["in_progress", "left", "todo"],
    ])("%s から %s で %s を返す", (from, direction, expected) => {
      expect(findAdjacentColumn(horizontalColumns, from, direction)?.id).toBe(expected);
    });

    it.each<[string, ArrowDirection]>([
      ["todo", "left"],
      ["done", "right"],
    ])("端の列(%s)から外側(%s)へは動かない", (from, direction) => {
      expect(findAdjacentColumn(horizontalColumns, from, direction)).toBeNull();
    });

    it.each<ArrowDirection>(["up", "down"])("上下のキー(%s)では動かない", (direction) => {
      expect(findAdjacentColumn(horizontalColumns, "in_progress", direction)).toBeNull();
    });
  });

  describe("縦積み", () => {
    it.each<[string, ArrowDirection, string]>([
      ["todo", "down", "in_progress"],
      ["in_progress", "down", "done"],
      ["done", "up", "in_progress"],
      ["in_progress", "up", "todo"],
    ])("%s から %s で %s を返す", (from, direction, expected) => {
      expect(findAdjacentColumn(verticalColumns, from, direction)?.id).toBe(expected);
    });

    it.each<[string, ArrowDirection]>([
      ["todo", "up"],
      ["done", "down"],
    ])("端の列(%s)から外側(%s)へは動かない", (from, direction) => {
      expect(findAdjacentColumn(verticalColumns, from, direction)).toBeNull();
    });

    it.each<ArrowDirection>(["left", "right"])("左右のキー(%s)では動かない", (direction) => {
      expect(findAdjacentColumn(verticalColumns, "in_progress", direction)).toBeNull();
    });
  });

  it("渡された順序ではなく実際の位置で隣を決める", () => {
    const shuffled = [horizontalColumns[2], horizontalColumns[0], horizontalColumns[1]];
    expect(findAdjacentColumn(shuffled, "todo", "right")?.id).toBe("in_progress");
    expect(findAdjacentColumn(shuffled, "done", "left")?.id).toBe("in_progress");
  });

  it("現在の列が見つからない場合は動かない", () => {
    expect(findAdjacentColumn(horizontalColumns, "unknown", "right")).toBeNull();
  });
});

describe("getCoordinatesInColumn", () => {
  const card = { width: 276, height: 80 };

  it("横並びでは列内での位置を保ったまま移動先の列へ移す", () => {
    const [todo, inProgress] = horizontalColumns.map((c) => c.rect);
    const cardRect = { ...card, left: todo.left + 12, top: todo.top + 150 };
    expect(getCoordinatesInColumn(cardRect, todo, inProgress)).toEqual({
      x: inProgress.left + 12,
      y: inProgress.top + 150,
    });
  });

  it("移動先の列が低い場合はカードが列の内側に収まる位置に移す", () => {
    const [todo, inProgress] = verticalColumns.map((c) => c.rect);
    const cardRect = { ...card, left: todo.left + 12, top: todo.top + 400 };
    expect(getCoordinatesInColumn(cardRect, todo, inProgress)).toEqual({
      x: inProgress.left + 12,
      y: inProgress.top + inProgress.height - card.height,
    });
  });

  it("カードが移動先の列より大きい場合は列の左上にそろえる", () => {
    const [todo, inProgress] = verticalColumns.map((c) => c.rect);
    const cardRect = { width: 400, height: 300, left: todo.left, top: todo.top + 100 };
    expect(getCoordinatesInColumn(cardRect, todo, inProgress)).toEqual({
      x: inProgress.left,
      y: inProgress.top,
    });
  });
});
