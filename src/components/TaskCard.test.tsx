import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "買い物",
    description: "牛乳を買う",
    status: "todo",
    createdAt: "2026-10-18T00:00:00.000Z",
    ...overrides,
  };
}

function getAttributeTexts(): (string | null)[] {
  return within(screen.getByRole("list")).getAllByRole("listitem").map((item) => item.textContent);
}

describe("TaskCard", () => {
  it("担当者・優先度・期限をすべて設定すると、優先度 → 担当者 → 期限の順に表示する", () => {
    render(<TaskCard task={makeTask({ assignee: "山田", priority: "high", dueDate: "2026-10-31" })} />);
    expect(getAttributeTexts()).toEqual(["優先度: 高", "担当: 山田", "期限: 2026/10/31"]);
  });

  it("設定された項目だけを表示する", () => {
    render(<TaskCard task={makeTask({ priority: "low", dueDate: "2027-01-05" })} />);
    expect(getAttributeTexts()).toEqual(["優先度: 低", "期限: 2027/01/05"]);
  });

  it("担当者・優先度・期限がすべて未設定なら、付加属性の行を表示しない", () => {
    render(<TaskCard task={makeTask()} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "買い物" })).toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });

  it("期限を過ぎた日付も同じ形式で表示する", () => {
    render(<TaskCard task={makeTask({ dueDate: "2000-02-29" })} />);
    expect(getAttributeTexts()).toEqual(["期限: 2000/02/29"]);
  });
});
