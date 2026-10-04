import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest の globals を有効にしていないため、React Testing Library の自動クリーンアップが働かない
afterEach(() => {
  cleanup();
});
