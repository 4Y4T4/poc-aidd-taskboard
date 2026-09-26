import { pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";

// キーボード操作ではポインタの座標がないため、ドラッグ中のカードとの重なりで判定する
export const columnCollisionDetection: CollisionDetection = (args) =>
  args.pointerCoordinates !== null ? pointerWithin(args) : rectIntersection(args);
