import { describe, expect, it } from "vitest";
import { shouldSubmitOnEnter } from "./shouldSubmitOnEnter";

describe("shouldSubmitOnEnter", () => {
  it("通常の Enter では送信する", () => {
    expect(shouldSubmitOnEnter({ key: "Enter", isComposing: false, keyCode: 13 })).toBe(true);
  });

  it("IME 変換中(isComposing が true)の Enter では送信しない", () => {
    expect(shouldSubmitOnEnter({ key: "Enter", isComposing: true, keyCode: 13 })).toBe(false);
  });

  it("keyCode が 229 の Enter では送信しない", () => {
    expect(shouldSubmitOnEnter({ key: "Enter", isComposing: false, keyCode: 229 })).toBe(false);
  });

  it.each([
    ["a", 65],
    ["Tab", 9],
  ])("Enter 以外のキー(%s)では送信しない", (key, keyCode) => {
    expect(shouldSubmitOnEnter({ key, isComposing: false, keyCode })).toBe(false);
  });
});
