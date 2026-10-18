import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Task } from "@/types/task";
import { DraggableTaskCard } from "./DraggableTaskCard";

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

function renderCard(task: Task) {
  render(
    <DndContext>
      <DraggableTaskCard task={task} />
    </DndContext>,
  );
  return screen.getByRole("button", { name: task.title });
}

describe("DraggableTaskCard", () => {
  it("担当者・優先度・期限を、ドラッグ対象の説明として読み上げる", () => {
    const card = renderCard(makeTask({ assignee: "山田", priority: "high", dueDate: "2026-10-31" }));
    expect(card).toHaveAccessibleDescription(expect.stringContaining("優先度: 高 担当: 山田 期限: 2026/10/31"));
  });

  it("付加属性があっても、ドラッグの操作説明は残す", () => {
    // 操作説明の要素は DndContext ごとに1つ作られるため、同じ DndContext の中で比べる
    render(
      <DndContext>
        <DraggableTaskCard task={makeTask({ id: "task-1", title: "付加属性あり", priority: "low" })} />
        <DraggableTaskCard task={makeTask({ id: "task-2", title: "付加属性なし" })} />
      </DndContext>,
    );
    const withAttributes = screen.getByRole("button", { name: "付加属性あり" });
    const withoutAttributes = screen.getByRole("button", { name: "付加属性なし" });
    const instructions = withoutAttributes.getAttribute("aria-describedby");
    expect(instructions).not.toBeNull();
    expect(withAttributes.getAttribute("aria-describedby")?.split(" ")).toContain(instructions);
  });

  it("付加属性が未設定なら、説明に付加属性を含めない", () => {
    const card = renderCard(makeTask());
    expect(card).not.toHaveAccessibleDescription(expect.stringContaining("優先度"));
  });
});
