import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TITLE_MAX } from "@/lib/task/validation";
import { AddTaskForm } from "./AddTaskForm";

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(<AddTaskForm onSubmit={onSubmit} onCancel={onCancel} />);
  return {
    user,
    onSubmit,
    onCancel,
    title: screen.getByRole("textbox", { name: /タイトル/ }),
    description: screen.getByRole("textbox", { name: "説明" }),
    submitButton: screen.getByRole("button", { name: "追加" }),
  };
}

describe("AddTaskForm", () => {
  it("タイトルと説明を入力して追加すると、前後の空白を除いた値で onSubmit を呼ぶ", async () => {
    const { user, onSubmit, title, description, submitButton } = renderForm();
    await user.type(title, "  買い物  ");
    await user.type(description, "牛乳を買う");
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "買い物", description: "牛乳を買う" });
  });

  it("タイトル欄で Enter を押すと追加する", async () => {
    const { user, onSubmit, title } = renderForm();
    await user.type(title, "買い物{Enter}");
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "買い物", description: "" });
  });

  it("タイトルが空白だけのまま追加すると、エラーを表示してタイトル欄にフォーカスし、onSubmit を呼ばない", async () => {
    const { user, onSubmit, title, submitButton } = renderForm();
    await user.type(title, "   ");
    await user.click(submitButton);
    expect(screen.getByRole("alert")).toHaveTextContent("タイトルを入力してください");
    expect(title).toHaveFocus();
    expect(title).toBeInvalid();
    expect(title).toHaveAccessibleDescription(expect.stringContaining("タイトルを入力してください"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it(`タイトルが${TITLE_MAX + 1}文字のまま追加すると、文字数のエラーを表示する`, async () => {
    const { user, onSubmit, title, submitButton } = renderForm();
    await user.type(title, "あ".repeat(TITLE_MAX + 1));
    await user.click(submitButton);
    expect(screen.getByRole("alert")).toHaveTextContent(`タイトルは${TITLE_MAX}文字以内で入力してください`);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("キャンセルを押すと onCancel を呼び、onSubmit は呼ばない", async () => {
    const { user, onSubmit, onCancel } = renderForm();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
