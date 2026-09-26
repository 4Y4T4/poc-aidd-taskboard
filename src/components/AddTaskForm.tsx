import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { shouldSubmitOnEnter } from "@/lib/form/shouldSubmitOnEnter";
import {
  countGraphemes,
  DESCRIPTION_MAX,
  TITLE_MAX,
  validateTaskInput,
  type TaskInput,
  type TaskInputErrors,
} from "@/lib/task/validation";

type AddTaskFormProps = {
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
};

export function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<TaskInputErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const id = useId();
  const titleId = `${id}-title`;
  const titleCounterId = `${id}-title-counter`;
  const titleErrorId = `${id}-title-error`;
  const descriptionId = `${id}-description`;
  const descriptionCounterId = `${id}-description-counter`;
  const descriptionErrorId = `${id}-description-error`;

  // 検証と同じく前後の空白を除いた値で数え、カウンターの赤字とエラーの有無を一致させる
  const titleLength = countGraphemes(title.trim());
  const descriptionLength = countGraphemes(description.trim());

  function submit() {
    const result = validateTaskInput({ title, description });
    if (!result.ok) {
      // フォーカス先の aria-describedby がエラー文を指してから移さないと読み上げられないため、先に DOM へ反映する
      flushSync(() => setErrors(result.errors));
      (result.errors.title !== undefined ? titleRef : descriptionRef).current?.focus();
      return;
    }
    onSubmit(result.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
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
          onKeyDown={handleTitleKeyDown}
          autoFocus
          aria-required="true"
          aria-invalid={errors.title !== undefined}
          aria-describedby={
            errors.title !== undefined ? `${titleErrorId} ${titleCounterId}` : titleCounterId
          }
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 aria-invalid:border-red-600"
        />
        {errors.title !== undefined && (
          <p id={titleErrorId} className="mt-1 text-sm text-red-600">
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
          <p id={descriptionErrorId} className="mt-1 text-sm text-red-600">
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
