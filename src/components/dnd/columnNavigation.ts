export type ArrowDirection = "left" | "right" | "up" | "down";

export type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ColumnRect<Id> = {
  id: Id;
  rect: RectLike;
};

export type Coordinates = {
  x: number;
  y: number;
};

const ARROW_DIRECTIONS: Readonly<Record<string, ArrowDirection>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export function getArrowDirection(code: string): ArrowDirection | null {
  return ARROW_DIRECTIONS[code] ?? null;
}

function centerOf(rect: RectLike): Coordinates {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// 列の中心が横方向に大きく散らばっていれば横並び、縦方向なら縦積みとみなす
export function isHorizontalLayout(rects: readonly RectLike[]): boolean {
  const centers = rects.map(centerOf);
  const xs = centers.map((c) => c.x);
  const ys = centers.map((c) => c.y);
  return Math.max(...xs) - Math.min(...xs) > Math.max(...ys) - Math.min(...ys);
}

export function findAdjacentColumn<Id>(
  columns: readonly ColumnRect<Id>[],
  currentId: Id,
  direction: ArrowDirection,
): ColumnRect<Id> | null {
  const horizontal = isHorizontalLayout(columns.map((column) => column.rect));
  const steps: Partial<Record<ArrowDirection, number>> = horizontal
    ? { left: -1, right: 1 }
    : { up: -1, down: 1 };
  const step = steps[direction];
  if (step === undefined) {
    return null;
  }
  const sorted = [...columns].sort((a, b) =>
    horizontal ? a.rect.left - b.rect.left : a.rect.top - b.rect.top,
  );
  const index = sorted.findIndex((column) => column.id === currentId);
  if (index === -1) {
    return null;
  }
  return sorted[index + step] ?? null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 移動元の列の中での位置関係をできるだけ保ったまま、カードが移動先の列の内側に収まる左上座標を返す
export function getCoordinatesInColumn(
  card: RectLike,
  from: RectLike,
  to: RectLike,
): Coordinates {
  return {
    x: to.left + clamp(card.left - from.left, 0, Math.max(0, to.width - card.width)),
    y: to.top + clamp(card.top - from.top, 0, Math.max(0, to.height - card.height)),
  };
}
