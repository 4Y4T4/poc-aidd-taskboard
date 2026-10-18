import { describe, expect, it } from "vitest";
import {
  ASSIGNEE_MAX,
  countGraphemes,
  DESCRIPTION_MAX,
  TITLE_MAX,
  validateTaskInput,
  type TaskInput,
} from "./validation";

const FAMILY = "👨‍👩‍👧";
const FLAG_JP = "🇯🇵";
const GA_COMBINING = "か\u3099";

const EMPTY_INPUT: TaskInput = { title: "", description: "", assignee: "", priority: "", dueDate: "" };

// フォームから渡される形(未設定の項目は空文字)にそろえ、各テストでは検証したい項目だけを書く
function validate(input: Partial<TaskInput>) {
  return validateTaskInput({ ...EMPTY_INPUT, ...input });
}

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
    expect(ASSIGNEE_MAX).toBe(20);
  });

  describe("タイトルの必須チェック", () => {
    it("タイトルが空文字ならエラー", () => {
      expect(validate({ title: "", description: "" })).toEqual({
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
      expect(validate({ title, description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルを入力してください" },
      });
    });
  });

  describe("タイトルの文字数", () => {
    it("タイトル1文字はOK", () => {
      expect(validate({ title: "a", description: "" })).toEqual({
        ok: true,
        value: { title: "a", description: "" },
      });
    });

    it("タイトル50文字はOK", () => {
      const title = "あ".repeat(50);
      expect(validate({ title, description: "" })).toEqual({
        ok: true,
        value: { title, description: "" },
      });
    });

    it("タイトル51文字はエラー", () => {
      expect(validate({ title: "あ".repeat(51), description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルは50文字以内で入力してください" },
      });
    });

    it.each([
      ["ZWJ結合絵文字", FAMILY],
      ["国旗", FLAG_JP],
      ["結合文字の が", GA_COMBINING],
    ])("タイトルが%s50個ならOK、51個ならエラー", (_, char) => {
      expect(validate({ title: char.repeat(50), description: "" }).ok).toBe(true);
      expect(validate({ title: char.repeat(51), description: "" })).toEqual({
        ok: false,
        errors: { title: "タイトルは50文字以内で入力してください" },
      });
    });

    it("前後の空白を除いて50文字ならOK", () => {
      const title = "あ".repeat(50);
      expect(validate({ title: `  ${title}\n`, description: "" })).toEqual({
        ok: true,
        value: { title, description: "" },
      });
    });
  });

  describe("説明の文字数", () => {
    it("説明が空でもOK", () => {
      expect(validate({ title: "タスク", description: "" })).toEqual({
        ok: true,
        value: { title: "タスク", description: "" },
      });
    });

    it("説明が空白のみなら空文字としてOK", () => {
      expect(validate({ title: "タスク", description: " \t\n " })).toEqual({
        ok: true,
        value: { title: "タスク", description: "" },
      });
    });

    it("説明500文字はOK", () => {
      const description = "あ".repeat(500);
      expect(validate({ title: "タスク", description })).toEqual({
        ok: true,
        value: { title: "タスク", description },
      });
    });

    it("説明501文字はエラー", () => {
      expect(validate({ title: "タスク", description: "あ".repeat(501) })).toEqual({
        ok: false,
        errors: { description: "説明は500文字以内で入力してください" },
      });
    });

    it("説明がZWJ結合絵文字500個ならOK、501個ならエラー", () => {
      expect(validate({ title: "タスク", description: FAMILY.repeat(500) }).ok).toBe(
        true,
      );
      expect(validate({ title: "タスク", description: FAMILY.repeat(501) })).toEqual({
        ok: false,
        errors: { description: "説明は500文字以内で入力してください" },
      });
    });

    it("説明の途中の改行も1文字と数え、改行込みで500文字ならOK", () => {
      const description = "あ\n".repeat(250).trimEnd() + "あ";
      expect(countGraphemes(description)).toBe(500);
      expect(validate({ title: "タスク", description }).ok).toBe(true);
    });
  });

  describe("trim", () => {
    it("タイトルと説明の前後のスペース・タブ・改行を除去した値を返す", () => {
      expect(
        validate({ title: " \t 買い物 \n", description: "\n\t 牛乳を買う \t\n" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳を買う" },
      });
    });

    it("タイトルと説明の前後の全角スペースを除去した値を返す", () => {
      expect(
        validate({ title: "\u3000買い物\u3000", description: "\u3000牛乳を買う\u3000" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳を買う" },
      });
    });

    it("説明の途中の改行は保持する", () => {
      expect(
        validate({ title: "買い物", description: "\n牛乳\n\n卵\r\nパン\n" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳\n\n卵\r\nパン" },
      });
    });
  });

  describe("複数項目のエラー", () => {
    it("タイトルが空で説明が501文字なら両方のエラーを同時に返す", () => {
      expect(validate({ title: " ", description: "あ".repeat(501) })).toEqual({
        ok: false,
        errors: {
          title: "タイトルを入力してください",
          description: "説明は500文字以内で入力してください",
        },
      });
    });

    it("タイトルが51文字で説明が501文字なら両方のエラーを同時に返す", () => {
      expect(
        validate({ title: "あ".repeat(51), description: "あ".repeat(501) }),
      ).toEqual({
        ok: false,
        errors: {
          title: "タイトルは50文字以内で入力してください",
          description: "説明は500文字以内で入力してください",
        },
      });
    });
  });
  describe("担当者", () => {
    it("担当者が空なら未設定として扱い、value に assignee を持たない", () => {
      const result = validate({ title: "タスク", assignee: "" });
      expect(result).toEqual({ ok: true, value: { title: "タスク", description: "" } });
      expect(result.ok && Object.hasOwn(result.value, "assignee")).toBe(false);
    });

    it.each([
      ["スペースのみ", "   "],
      ["タブ・改行の混在", "\t\n "],
      ["全角スペースのみ", "\u3000\u3000"],
    ])("担当者が%sならエラーにせず未設定として扱う", (_, assignee) => {
      const result = validate({ title: "タスク", assignee });
      expect(result).toEqual({ ok: true, value: { title: "タスク", description: "" } });
      expect(result.ok && Object.hasOwn(result.value, "assignee")).toBe(false);
    });

    it("担当者1文字はOK", () => {
      expect(validate({ title: "タスク", assignee: "山" })).toEqual({
        ok: true,
        value: { title: "タスク", description: "", assignee: "山" },
      });
    });

    it("担当者20文字はOK", () => {
      const assignee = "あ".repeat(ASSIGNEE_MAX);
      expect(validate({ title: "タスク", assignee })).toEqual({
        ok: true,
        value: { title: "タスク", description: "", assignee },
      });
    });

    it("担当者21文字はエラー", () => {
      expect(validate({ title: "タスク", assignee: "あ".repeat(ASSIGNEE_MAX + 1) })).toEqual({
        ok: false,
        errors: { assignee: "担当者は20文字以内で入力してください" },
      });
    });

    it.each([
      ["ZWJ結合絵文字", FAMILY],
      ["国旗", FLAG_JP],
      ["結合文字の が", GA_COMBINING],
    ])("担当者が%s20個ならOK、21個ならエラー", (_, char) => {
      expect(validate({ title: "タスク", assignee: char.repeat(ASSIGNEE_MAX) }).ok).toBe(true);
      expect(validate({ title: "タスク", assignee: char.repeat(ASSIGNEE_MAX + 1) })).toEqual({
        ok: false,
        errors: { assignee: "担当者は20文字以内で入力してください" },
      });
    });

    it("前後の空白を除いた値を返し、除いて20文字ならOK", () => {
      const assignee = "あ".repeat(ASSIGNEE_MAX);
      expect(validate({ title: "タスク", assignee: `\u3000 ${assignee}\t\n` })).toEqual({
        ok: true,
        value: { title: "タスク", description: "", assignee },
      });
    });
  });

  describe("優先度", () => {
    it("優先度が空(未設定)なら value に priority を持たない", () => {
      const result = validate({ title: "タスク", priority: "" });
      expect(result).toEqual({ ok: true, value: { title: "タスク", description: "" } });
      expect(result.ok && Object.hasOwn(result.value, "priority")).toBe(false);
    });

    it.each(["high", "medium", "low"] as const)("優先度 %s はOK", (priority) => {
      expect(validate({ title: "タスク", priority })).toEqual({
        ok: true,
        value: { title: "タスク", description: "", priority },
      });
    });

    it.each([
      ["未定義の値", "urgent"],
      ["大文字", "HIGH"],
      ["表示名", "高"],
      ["数値の文字列", "1"],
    ])("優先度が%sならエラー", (_, priority) => {
      expect(validate({ title: "タスク", priority })).toEqual({
        ok: false,
        errors: { priority: "優先度を選択肢から選んでください" },
      });
    });
  });

  describe("期限", () => {
    it("期限が空(未設定)なら value に dueDate を持たない", () => {
      const result = validate({ title: "タスク", dueDate: "" });
      expect(result).toEqual({ ok: true, value: { title: "タスク", description: "" } });
      expect(result.ok && Object.hasOwn(result.value, "dueDate")).toBe(false);
    });

    it.each([
      ["通常の日付", "2026-10-31"],
      ["過去の日付", "2000-01-01"],
      ["うるう年の2月29日", "2028-02-29"],
      ["400で割り切れる年の2月29日", "2000-02-29"],
      ["年末", "2026-12-31"],
      ["年始", "2027-01-01"],
    ])("期限が%sならOK", (_, dueDate) => {
      expect(validate({ title: "タスク", dueDate })).toEqual({
        ok: true,
        value: { title: "タスク", description: "", dueDate },
      });
    });

    it.each([
      ["存在しない日(2月30日)", "2026-02-30"],
      ["うるう年でない年の2月29日", "2026-02-29"],
      ["100で割り切れ400で割り切れない年の2月29日", "2100-02-29"],
      ["30日までの月の31日", "2026-04-31"],
      ["13月", "2026-13-01"],
      ["0月", "2026-00-10"],
      ["0日", "2026-01-00"],
      ["32日", "2026-01-32"],
      ["スラッシュ区切り", "2026/10/31"],
      ["ゼロ埋めなし", "2026-1-5"],
      ["年が2桁", "26-10-31"],
      ["時刻付き", "2026-10-31T00:00:00.000Z"],
      ["日付でない文字列", "abc"],
      ["全角数字", "２０２６-１０-３１"],
    ])("期限が%sならエラー", (_, dueDate) => {
      expect(validate({ title: "タスク", dueDate })).toEqual({
        ok: false,
        errors: { dueDate: "期限の日付が正しくありません" },
      });
    });
  });

  describe("付加属性をすべて設定した場合", () => {
    it("担当者・優先度・期限を持つ value を返す", () => {
      expect(
        validate({ title: "買い物", description: "牛乳", assignee: " 山田 ", priority: "high", dueDate: "2026-10-31" }),
      ).toEqual({
        ok: true,
        value: { title: "買い物", description: "牛乳", assignee: "山田", priority: "high", dueDate: "2026-10-31" },
      });
    });

    it("全項目が不正なら全項目のエラーを同時に返す", () => {
      expect(
        validate({
          title: "",
          description: "あ".repeat(DESCRIPTION_MAX + 1),
          assignee: "あ".repeat(ASSIGNEE_MAX + 1),
          priority: "urgent",
          dueDate: "2026-02-30",
        }),
      ).toEqual({
        ok: false,
        errors: {
          title: "タイトルを入力してください",
          description: "説明は500文字以内で入力してください",
          assignee: "担当者は20文字以内で入力してください",
          priority: "優先度を選択肢から選んでください",
          dueDate: "期限の日付が正しくありません",
        },
      });
    });
  });
});
