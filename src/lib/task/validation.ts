export const TITLE_MAX = 50;
export const DESCRIPTION_MAX = 500;

export type TaskInput = {
  title: string;
  description: string;
};

export type TaskInputErrors = Partial<Record<keyof TaskInput, string>>;

export type TaskInputValidationResult =
  | { ok: true; value: TaskInput }
  | { ok: false; errors: TaskInputErrors };

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function countGraphemes(str: string): number {
  return Array.from(graphemeSegmenter.segment(str)).length;
}

export function validateTaskInput(input: TaskInput): TaskInputValidationResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const errors: TaskInputErrors = {};

  if (title === "") {
    errors.title = "タイトルを入力してください";
  } else if (countGraphemes(title) > TITLE_MAX) {
    errors.title = "タイトルは50文字以内で入力してください";
  }

  if (countGraphemes(description) > DESCRIPTION_MAX) {
    errors.description = "説明は500文字以内で入力してください";
  }

  if (errors.title !== undefined || errors.description !== undefined) {
    return { ok: false, errors };
  }
  return { ok: true, value: { title, description } };
}
