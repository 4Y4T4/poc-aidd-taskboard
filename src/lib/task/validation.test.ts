import { describe, expect, it } from "vitest";
import {
  countGraphemes,
  DESCRIPTION_MAX,
  TITLE_MAX,
  validateTaskInput,
} from "./validation";

const FAMILY = "👨‍👩‍👧";
const FLAG_JP = "🇯🇵";
const GA_COMBINING = "か\u3099";

describe("countGraphemes", () => {
  it("空文字は0文字", () => {
    expect(countGraphemes("")).toBe(0);
  });

  it("ひらがな・英字は1文字ずつ数える", () => {
    expect(countGraphemes("あいu")).toBe(3);
  });

  it("ZWJ結合絵文字 👨‍👩‍👧 を1文字と数える", () => {
    expect(FAMILY.length).toBe(8);
    expect(countGraphemes(FAMILY)).toBe(1);
  });

  it("国旗 🇯🇵 を1文字と数える", () => {
    expect(FLAG_JP.length).toBe(4);
    expect(countGraphemes(FLAG_JP)).toBe(1);
  });

  it("結合文字の が(か + U+3099)を1文字と数える", () => {
    expect(GA_COMBINING.length).toBe(2);
    expect(countGraphemes(GA_COMBINING)).toBe(1);
  });
});

describe("validateTaskInput", () => {
  it("上限値を公開している", () => {
    expect(TITLE_MAX).toBe(50);
    expect(DESCRIPTION_MAX).toBe(500);
  });

  describe("タイトルの必須チェック", () => {
    it("タイトルが空文字ならエラー", () => {
      expect(validateTaskInput({ title: "", description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルを入力してください" },
      });
    });

    it.each([
      ["スペースのみ", "   "],
      ["タブのみ", "\t\t"],
      ["改行のみ", "\n\r\n"],
      ["スペース・タブ・改行の混在", " \t\n "],
      ["全角スペースのみ", "\u3000\u3000"],
    ])("タイトルが%sならエラー", (_, title) => {
      expect(validateTaskInput({ title, description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルを入力してください" },
      });
    });
  });

  describe("タイトルの文字数", () => {
    it("タイトル1文字はOK", () => {
      expect(validateTaskInput({ title: "a", description: "" })).toEqual({
        ok: true,
        value: { title: "a", description: "" },
      });
    });

    it("タイトル50文字はOK", () => {
      const title = "あ".repeat(50);
      expect(validateTaskInput({ title, description: "" })).toEqual({
        ok: true,
        value: { title, description: "" },
      });
    });

    it("タイトル51文字はエラー", () => {
      expect(validateTaskInput({ title: "あ".repeat(51), description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルは50文字以内で入力してください" },
      });
    });

    it.each([
      ["ZWJ結合絵文字", FAMILY],
      ["国旗", FLAG_JP],
      ["結合文字の が", GA_COMBINING],
    ])("タイトルが%s50個ならOK、51個ならエラー", (_, char) => {
      expect(validateTaskInput({ title: char.repeat(50), description: "" }).ok).toBe(true);
      expect(validateTaskInput({ title: char.repeat(51), description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルは50文字以内で入力してください" },
      });
    });

    it("前後の空白を除いて50文字ならOK", () => {
      const title = "あ".repeat(50);
      expect(validateTaskInput({ title: `  ${title}\n`, description: "" })).toEqual({
        ok: true,
        value: { title, description: "" },
      });
    });
  });

  describe("説明の文字数", () => {
    it("説明が空でもOK", () => {
      expect(validateTaskInput({ title: "タスク", description: "" })).toEqual({
        ok: true,
        value: { title: "タスク", description: "" },
      });
    });

    it("説明が空白のみなら空文字としてOK", () => {
      expect(validateTaskInput({ title: "タスク", description: " \t\n " })).toEqual({
        ok: true,
        value: { title: "タスク", description: "" },
      });
    });

    it("説明500文字はOK", () => {
      const description = "あ".repeat(500);
      expect(validateTaskInput({ title: "タスク", description })).toEqual({
        ok: true,
        value: { title: "タスク", description },
      });
    });

    it("説明501文字はエラー", () => {
      expect(validateTaskInput({ title: "タスク", description: "あ".repeat(501) })).toEqual({
        ok: false,
        errors: { description: "説明は500文字以内で入力してください" },
      });
    });

    it("説明がZWJ結合絵文字500個ならOK、501個ならエラー", () => {
      expect(validateTaskInput({ title: "タスク", description: FAMILY.repeat(500) }).ok).toBe(
        true,
      );
      expect(validateTaskInput({ title: "タスク", description: FAMILY.repeat(501) })).toEqual({
        ok: false,
        errors: { description: "説明は500文字以内で入力してください" },
      });
    });

    it("説明の途中の改行も1文字と数え、改行込みで500文字ならOK", () => {
      const description = "あ\n".repeat(250).trimEnd() + "あ";
      expect(countGraphemes(description)).toBe(500);
      expect(validateTaskInput({ title: "タスク", description }).ok).toBe(true);
    });
  });

  describe("trim", () => {
    it("タイトルと説明の前後のスペース・タブ・改行を除去した値を返す", () => {
      expect(
        validateTaskInput({ title: " \t 買い物 \n", description: "\n\t 牛乳を買う \t\n" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳を買う" },
      });
    });

    it("タイトルと説明の前後の全角スペースを除去した値を返す", () => {
      expect(
        validateTaskInput({ title: "\u3000買い物\u3000", description: "\u3000牛乳を買う\u3000" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳を買う" },
      });
    });

    it("説明の途中の改行は保持する", () => {
      expect(
        validateTaskInput({ title: "買い物", description: "\n牛乳\n\n卵\r\nパン\n" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳\n\n卵\r\nパン" },
      });
    });
  });

  describe("複数項目のエラー", () => {
    it("タイトルが空で説明が501文字なら両方のエラーを同時に返す", () => {
      expect(validateTaskInput({ title: " ", description: "あ".repeat(501) })).toEqual({
        ok: false,
        errors: {
          title: "タイトルを入力してください",
          description: "説明は500文字以内で入力してください",
        },
      });
    });

    it("タイトルが51文字で説明が501文字なら両方のエラーを同時に返す", () => {
      expect(
        validateTaskInput({ title: "あ".repeat(51), description: "あ".repeat(501) }),
      ).toEqual({
        ok: false,
        errors: {
          title: "タイトルは50文字以内で入力してください",
          description: "説明は500文字以内で入力してください",
        },
      });
    });
  });
});
