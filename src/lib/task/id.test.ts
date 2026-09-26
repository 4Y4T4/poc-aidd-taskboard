import { afterEach, describe, expect, it, vi } from "vitest";
import { generateId } from "./id";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("crypto.randomUUID が使える環境では UUID v4 形式の id を返す", () => {
    expect(generateId()).toMatch(UUID_V4);
  });

  it("crypto.randomUUID が使える環境では crypto.randomUUID の値を使う", () => {
    const uuid = "123e4567-e89b-42d3-a456-426614174000";
    vi.stubGlobal("crypto", {
      randomUUID: () => uuid,
      getRandomValues: () => {
        throw new Error("呼ばれない想定");
      },
    });
    expect(generateId()).toBe(uuid);
  });

  describe("crypto.randomUUID が使えない環境", () => {
    it("crypto.getRandomValues から UUID v4 形式の id を生成する", () => {
      const original = globalThis.crypto;
      vi.stubGlobal("crypto", {
        getRandomValues: original.getRandomValues.bind(original),
      });
      expect(generateId()).toMatch(UUID_V4);
    });

    it.each([
      ["すべて0", 0x00],
      ["すべて1", 0xff],
    ])("乱数のビットが%sでも version と variant を設定する", (_, fill) => {
      vi.stubGlobal("crypto", {
        getRandomValues: <T extends ArrayBufferView>(array: T): T => {
          new Uint8Array(array.buffer).fill(fill);
          return array;
        },
      });
      expect(generateId()).toMatch(UUID_V4);
    });

    it("呼び出しごとに異なる id を生成する", () => {
      const original = globalThis.crypto;
      vi.stubGlobal("crypto", {
        getRandomValues: original.getRandomValues.bind(original),
      });
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });
});
