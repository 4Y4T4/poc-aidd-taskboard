---
paths:
  - "**/*.{ts,tsx,mts}"
---

# TypeScript のルール

## any を避ける

- `any` を使わない。代わりに次の順で検討する。
    1. 具体的な型(`Task`・`TaskStatus` など)
    2. 呼び出し側によって型が変わるものはジェネリクス(例: `findAdjacentColumn<Id>(columns: readonly ColumnRect<Id>[], …)`)
    3. 取りうる値が決まっているものはユニオン型(`TaskStatus` など)
    4. 型が分からない外部の値(`JSON.parse` の結果・ライブラリから渡される id など)は `unknown` で受け、型ガード(`isTaskStatus` など)で絞ってから使う
- 型アサーション(`as`)で型を決めつけない。使うのは、実行時の値と矛盾しないことが分かっている次のような場合に限る。
    - 型ガードの中で、`readonly` 配列の `includes` に判定前の値を渡すとき(`COLUMN_ORDER as readonly unknown[]`)
    - ライブラリが型を持たない値で、値を入れる側が自分のコードだけのとき(dnd-kit の `active.data.current` を `TaskDragData` として読む)
    - テストで、わざと不正なデータを作るとき

## 型の import

- 型だけを import するときは `import type` を使う。

  ```ts
  import type { Task, TaskStatus } from "@/types/task";
  ```

- 同じモジュールから値と型の両方を import するときは、1行にまとめて型に `type` 修飾子を付ける。

  ```ts
  import { useId, useRef, type FormEvent } from "react";
  ```

## 型の置き場所

- タスクと列のデータモデルの型(`Task`・`TaskStatus` など)は `src/types/task.ts` に置く。ほかのファイルで同じ型を定義し直さない。
- 列の並び・表示名のような値は型ではないため、`src/lib/task/columns.ts`(`COLUMN_ORDER`・`COLUMN_LABELS`)に置く。
- 特定の関数やコンポーネントの入出力にだけ使う型(`TaskInput`・`TaskStore`・`ColumnProps` など)は、その関数・コンポーネントと同じファイルに置く。
