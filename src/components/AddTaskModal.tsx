import { useId, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { TaskInput } from "@/lib/task/validation";
import { AddTaskForm } from "./AddTaskForm";

type AddTaskModalProps = {
  onAdd: (input: TaskInput) => void;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AddTaskModal({ onAdd, onClose }: AddTaskModalProps) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // 入力欄で押して背景で離した場合も click は背景(共通の祖先)で発生するため、押した位置を記録して区別する
  const pointerDownOnOverlayRef = useRef(false);

  function handleOverlayPointerDown(e: PointerEvent<HTMLDivElement>) {
    pointerDownOnOverlayRef.current = e.target === e.currentTarget;
  }

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    const pressedOnOverlay = pointerDownOnOverlayRef.current;
    pointerDownOnOverlayRef.current = false;
    if (pressedOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleDialogKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || dialogRef.current === null) {
      return;
    }
    const focusables = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    // ダイアログ自身(余白のクリックでフォーカスされる)にいる場合も内側の要素へ移す
    if (e.shiftKey && (active === first || active === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || active === dialogRef.current)) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      onPointerDown={handleOverlayPointerDown}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex overflow-y-auto bg-black/50 p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className="m-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-xl focus:outline-none"
      >
        <h2 id={headingId} className="mb-4 text-lg font-bold text-gray-900">
          タスクを追加
        </h2>
        <AddTaskForm onSubmit={onAdd} onCancel={onClose} />
      </div>
    </div>
  );
}
