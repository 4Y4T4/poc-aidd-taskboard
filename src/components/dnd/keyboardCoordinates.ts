import type { KeyboardCoordinateGetter, UniqueIdentifier } from "@dnd-kit/core";
import { findAdjacentColumn, getArrowDirection, getCoordinatesInColumn } from "./columnNavigation";
import { getDraggedTask } from "./taskDragData";

// 矢印キー1回で隣の列へカードを移す(dnd-kit 標準は一定ピクセルずつ動かすため)
export const columnKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const direction = getArrowDirection(event.code);
  if (direction === null) {
    return undefined;
  }
  // 移動しない場合(端の列・関係ない方向)に既定のページスクロールが起きると、
  // 固定表示のカードの下で列がずれてドロップ先が変わってしまうため、常に止める
  event.preventDefault();

  const { collisionRect, droppableRects, over, active } = context;
  const currentId: UniqueIdentifier | undefined =
    over?.id ?? (active !== null ? getDraggedTask(active)?.status : undefined);
  if (collisionRect === null || currentId === undefined) {
    return undefined;
  }
  const currentRect = droppableRects.get(currentId);
  if (currentRect === undefined) {
    return undefined;
  }

  const columns = Array.from(droppableRects, ([id, rect]) => ({ id, rect }));
  const target = findAdjacentColumn(columns, currentId, direction);
  if (target === null) {
    return undefined;
  }
  return getCoordinatesInColumn(collisionRect, currentRect, target.rect);
};
