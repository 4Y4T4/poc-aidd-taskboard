import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { flushSync } from "react-dom";
import { shouldSubmitOnEnter } from "@/lib/form/shouldSubmitOnEnter";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "@/lib/task/priorities";
import {
  ASSIGNEE_MAX,
  countGraphemes,
  DESCRIPTION_MAX,
  TITLE_MAX,
  validateTaskInput,
  type TaskInput,
  type TaskInputErrors,
  type ValidTaskInput,
} from "@/lib/task/validation";

type AddTaskFormProps = {
  onSubmit: (input: ValidTaskInput) => void;
  onCancel: () => void;
};

export function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<TaskInputErrors>({});
  // role="alert" は要素が追加されたときに読み上げられるため、同じエラーのまま再送信しても読み上げるよう失敗のたびに作り直す
  const [failedSubmitCount, setFailedSubmitCount] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const assigneeRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  // エラーのある最初の欄にフォーカスするため、画面上の並びと同じ順に並べる
  const fieldRefs: readonly [keyof TaskInput, RefObject<HTMLElement | null>][] = [
    ["title", titleRef],
    ["description", descriptionRef],
    ["assignee", assigneeRef],
    ["priority", priorityRef],
    ["dueDate", dueDateRef],
  ];

  const id = useId();
  const titleId = `${id}-title`;
  const titleCounterId = `${id}-title-counter`;
  const titleErrorId = `${id}-title-error`;
  const descriptionId = `${id}-description`;
  const descriptionCounterId = `${id}-description-counter`;
  const descriptionErrorId = `${id}-description-error`;
  const assigneeId = `${id}-assignee`;
  const assigneeCounterId = `${id}-assignee-counter`;
  const assigneeErrorId = `${id}-assignee-error`;
  const priorityId = `${id}-priority`;
  const priorityErrorId = `${id}-priority-error`;
  const dueDateId = `${id}-due-date`;
  const dueDateErrorId = `${id}-due-date-error`;

  // 検証と同じく前後の空白を除いた値で数え、カウンターの赤字とエラーの有無を一致させる
  const titleLength = countGraphemes(title.trim());
  const descriptionLength = countGraphemes(description.trim());
  const assigneeLength = countGraphemes(assignee.trim());

  function submit() {
    const result = validateTaskInput({ title, description, assignee, priority, dueDate });
    if (!result.ok) {
      // フォーカス先の aria-describedby がエラー文を指してから移さないと読み上げられないため、先に DOM へ反映する
      flushSync(() => {
        setErrors(result.errors);
        setFailedSubmitCount((count) => count + 1);
      });
      const firstInvalidField = fieldRefs.find(([field]) => result.errors[field] !== undefined);
      firstInvalidField?.[1].current?.focus();
      return;
    }
    onSubmit(result.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleSingleLineKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") {
      return;
    }
    // ブラウザの暗黙の送信(implicit submission)は IME 確定の Enter を区別できないため常に止め、送信するかは自前で判定する
    e.preventDefault();
    if (shouldSubmitOnEnter(e.nativeEvent)) {
      submit();
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor={titleId} className="block text-sm font-semibold text-gray-800">
          タイトル
          <span className="ml-1 text-xs font-normal text-red-600">(必須)</span>
        </label>
        <input
          ref={titleRef}
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleSingleLineKeyDown}
          autoFocus
          aria-required="true"
          aria-invalid={errors.title !== undefined}
          aria-describedby={
            errors.title !== undefined ? `${titleErrorId} ${titleCounterId}` : titleCounterId
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
        />
        {errors.title !== undefined && (
          <p key={failedSubmitCount} id={titleErrorId} role="alert" className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
        <p
          id={titleCounterId}
          className={`mt-1 text-right text-xs ${titleLength > TITLE_MAX ? "text-red-600" : "text-gray-500"}`}
        >
          {titleLength} / {TITLE_MAX}
        </p>
      </div>
      <div>
        <label htmlFor={descriptionId} className="block text-sm font-semibold text-gray-800">
          説明
        </label>
        <textarea
          ref={descriptionRef}
          id={descriptionId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          aria-invalid={errors.description !== undefined}
          aria-describedby={
            errors.description !== undefined
              ? `${descriptionErrorId} ${descriptionCounterId}`
              : descriptionCounterId
          }
          className="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
        />
        {errors.description !== undefined && (
          <p
            key={failedSubmitCount}
            id={descriptionErrorId}
            role="alert"
            className="mt-1 text-sm text-red-600"
          >
            {errors.description}
          </p>
        )}
        <p
          id={descriptionCounterId}
          className={`mt-1 text-right text-xs ${descriptionLength > DESCRIPTION_MAX ? "text-red-600" : "text-gray-500"}`}
        >
          {descriptionLength} / {DESCRIPTION_MAX}
        </p>
      </div>
      <div>
        <label htmlFor={assigneeId} className="block text-sm font-semibold text-gray-800">
          担当者
        </label>
        <input
          ref={assigneeRef}
          id={assigneeId}
          type="text"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          onKeyDown={handleSingleLineKeyDown}
          aria-invalid={errors.assignee !== undefined}
          aria-describedby={
            errors.assignee !== undefined ? `${assigneeErrorId} ${assigneeCounterId}` : assigneeCounterId
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
        />
        {errors.assignee !== undefined && (
          <p key={failedSubmitCount} id={assigneeErrorId} role="alert" className="mt-1 text-sm text-red-600">
            {errors.assignee}
          </p>
        )}
        <p
          id={assigneeCounterId}
          className={`mt-1 text-right text-xs ${assigneeLength > ASSIGNEE_MAX ? "text-red-600" : "text-gray-500"}`}
        >
          {assigneeLength} / {ASSIGNEE_MAX}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={priorityId} className="block text-sm font-semibold text-gray-800">
            優先度
          </label>
          <select
            ref={priorityRef}
            id={priorityId}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-invalid={errors.priority !== undefined}
            aria-describedby={errors.priority !== undefined ? priorityErrorId : undefined}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
          >
            <option value="">未設定</option>
            {PRIORITY_ORDER.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
          {errors.priority !== undefined && (
            <p key={failedSubmitCount} id={priorityErrorId} role="alert" className="mt-1 text-sm text-red-600">
              {errors.priority}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={dueDateId} className="block text-sm font-semibold text-gray-800">
            期限
          </label>
          <input
            ref={dueDateRef}
            id={dueDateId}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-invalid={errors.dueDate !== undefined}
            aria-describedby={errors.dueDate !== undefined ? dueDateErrorId : undefined}
            className="mt-1 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
          />
          {errors.dueDate !== undefined && (
            <p key={failedSubmitCount} id={dueDateErrorId} role="alert" className="mt-1 text-sm text-red-600">
              {errors.dueDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          追加
        </button>
      </div>
    </form>
  );
}
