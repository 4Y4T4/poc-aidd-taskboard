---
paths:
  - "src/lib/**"
---

# タスクのロジック・永続化のルール

`src/lib/` には React・DOM に依存しない純粋関数を置く(`task/`: 列の定義・バリデーション・ID 生成・作成/移動、`storage/`: localStorage の読み書き、`form/`: フォームの送信判定)。タスクと列の型は `src/types/task.ts` にある(`typescript.md`)。

## 関数の作り方

- 引数で受け取った配列やオブジェクトを変更せず、新しい値を返す。
- 変更がない場合(対象のタスクがない、同じ列への移動など)は、受け取った配列をそのまま返す。`taskStore` は参照が同じかどうかで、保存と再描画を省いている。
- 現在時刻・ストレージなどの外部の値は、引数で差し替えられるようにする(`now: Date = new Date()`、`storage?: Storage` など)。テストでグローバルをモックしなくて済むようにするため。

## タスクとステータス

- ステータスの値は `TaskStatus` 型だけを使い、列の並びと表示名は `COLUMN_ORDER`・`COLUMN_LABELS`(`src/lib/task/columns.ts`)から取る。ステータスの一覧を別の場所に書き写さない。
- 新しく作るタスクの `status` は `"todo"` にし、配列の末尾に追加する。列を移動したタスクは配列から取り除いて末尾に追加する(`docs/requirements.md` 3.4)。
- 入力のバリデーションは `validateTaskInput` にまとめる。文字数は書記素(`countGraphemes`)で数え、上限は `TITLE_MAX`・`DESCRIPTION_MAX` を使う。
- 結果を返す関数は `{ ok: true; value } | { ok: false; errors }` の形にし、例外で失敗を伝えない。

## 永続化

- 保存先は localStorage だけにする。Route Handler・Server Actions・データベースは作らない。
- 保存形式(キー `taskboard:tasks`・`version`・各項目)は `docs/requirements.md` 3.5 に合わせる。形式を変えるときは、既存の保存データをそのまま読み込めるようにする。
- 読み込みでは例外を外に出さない。読めない・形式が不正なデータは `console.warn` で理由を出して破棄し、不正なタスクだけを除いて残りを読み込む。
- 読み込んだタスクも、作成時と同じバリデーションとステータスの判定を通す。
