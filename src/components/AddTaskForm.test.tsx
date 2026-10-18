import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ASSIGNEE_MAX, TITLE_MAX } from "@/lib/task/validation";
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
    assignee: screen.getByRole("textbox", { name: "担当者" }),
    priority: screen.getByRole("combobox", { name: "優先度" }),
    dueDate: screen.getByLabelText("期限"),
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

  it("担当者・優先度・期限を入力して追加すると、その値で onSubmit を呼ぶ(担当者は前後の空白を除く)", async () => {
    const { user, onSubmit, title, assignee, priority, dueDate, submitButton } = renderForm();
    await user.type(title, "買い物");
    await user.type(assignee, "  山田  ");
    await user.selectOptions(priority, "高");
    await user.type(dueDate, "2026-10-31");
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      title: "買い物",
      description: "",
      assignee: "山田",
      priority: "high",
      dueDate: "2026-10-31",
    });
  });

  it("優先度の初期値は「未設定」で、選択肢は「未設定」「高」「中」「低」の順に並ぶ", () => {
    const { priority } = renderForm();
    expect(priority).toHaveDisplayValue("未設定");
    expect(within(priority).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "未設定",
      "高",
      "中",
      "低",
    ]);
  });

  it("担当者欄で Enter を押すと追加する", async () => {
    const { user, onSubmit, title, assignee } = renderForm();
    await user.type(title, "買い物");
    await user.type(assignee, "山田{Enter}");
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "買い物", description: "", assignee: "山田" });
  });

  it(`担当者が${ASSIGNEE_MAX + 1}文字のまま追加すると、エラーを表示して担当者欄にフォーカスし、onSubmit を呼ばない`, async () => {
    const { user, onSubmit, title, assignee, submitButton } = renderForm();
    await user.type(title, "買い物");
    await user.type(assignee, "あ".repeat(ASSIGNEE_MAX + 1));
    await user.click(submitButton);
    expect(screen.getByRole("alert")).toHaveTextContent(`担当者は${ASSIGNEE_MAX}文字以内で入力してください`);
    expect(assignee).toHaveFocus();
    expect(assignee).toBeInvalid();
    expect(assignee).toHaveAccessibleDescription(
      expect.stringContaining(`担当者は${ASSIGNEE_MAX}文字以内で入力してください`),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("タイトルと担当者の両方にエラーがあるときは、タイトル欄にフォーカスする", async () => {
    const { user, onSubmit, title, assignee, submitButton } = renderForm();
    await user.type(assignee, "あ".repeat(ASSIGNEE_MAX + 1));
    await user.click(submitButton);
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(title).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("担当者の文字数を前後の空白を除いて数え、上限との比較で表示する", async () => {
    const { user, assignee } = renderForm();
    await user.type(assignee, " 山田 ");
    expect(assignee).toHaveAccessibleDescription(`2 / ${ASSIGNEE_MAX}`);
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
