# タスクボードアプリケーション 実行計画

> 関連Issue: #5
> [要件定義書](requirements.md) の内容を実装するための作業分割・着手順序・完了条件をまとめたものです。各作業は実装Issueとして起票済みです。

## 1. 方針

- 1つのIssueを1つのPRで無理なくレビューできる粒度に分割する。ブランチは `feature/#Issue番号` とする。
- ロジックとUIを分ける。
    - `src/lib/task/`・`src/lib/storage/` の純粋関数(データモデル・バリデーション・作成/移動・localStorage 読み書き)は **backend-developer** が担当し、要件定義書 6章のユニットテストのうち、Enter キーの送信判定以外をここで満たす。
    - React コンポーネント・フック・ドラッグ&ドロップと、フォーム用の純粋関数 `src/lib/form/`(Enter キーの送信判定とそのユニットテスト、#11)は **frontend-developer** が担当する。
- 永続化は localStorage のみとする。backend-developer の定義には Route Handler への言及があるが、本プロジェクトでは Route Handler や Server Actions は作らない(各Issueにも明記済み)。
- PRのレビューは毎回 `/pr-review`(code-reviewer の観点)で行う。
- 要件定義書にない機能は追加しない。

## 2. 実装Issue一覧

| Issue | 作業 | 担当 | 依存 | 主な参照章 | ユニットテスト(6章の観点) |
| --- | --- | --- | --- | --- | --- |
| #6 | プロジェクトの初期構築(Next.js・Tailwind CSS・Vitest・dnd-kit) | frontend-developer | なし | CLAUDE.md「技術スタック」、4.3、6章 | なし(ダミーテストは置かない) |
| #7 | タスクのデータモデルと入力バリデーション | backend-developer | #6 | 3.1、3.2、4.2、5章 No.1〜4 | 入力値のバリデーション |
| #8 | タスクの作成・列移動ロジック | backend-developer | #7 | 3.1、3.3、3.4、4.2、4.3 | タスクの作成、タスクの列移動 |
| #9 | localStorage への保存・読み込み | backend-developer | #7 | 3.5、5章 No.8〜13 | localStorage からの読み込み・保存 |
| #10 | カンバンボードの表示 | frontend-developer | #8、#9 | 2.1〜2.4、3.4、4.1 | なし(画面で確認) |
| #11 | タスク追加モーダル | frontend-developer | #10 | 4.2、6章(アクセシビリティ) | Enter キーによる送信判定 |
| #12 | ドラッグ&ドロップによる列移動 | frontend-developer | #10 | 4.3、2.2、3.3 | なし(列移動のロジックは #8 で確認済み) |

各作業の詳しい対応内容と完了条件は、それぞれのIssue本文を参照してください。

## 3. 依存関係と着手順序

```
#6 ─→ #7 ─┬─→ #8 ─┐
          └─→ #9 ─┴─→ #10 ─┬─→ #11
                           └─→ #12
```

1. #6 初期構築
2. #7 データモデルと入力バリデーション
3. #8 と #9 を並行して進める(どちらも backend-developer、ファイルは重ならない)
4. #10 ボード表示と `useTasks` フック
5. #11 と #12 を並行して進める
    - どちらも `Board.tsx`・`Header.tsx`・`useTasks.ts` を変更するため、コンフリクトが起きやすい。先にマージした方を取り込んでから、もう一方をマージする。
    - 直列に進める場合は #11 → #12 の順にする。画面からタスクを作れるようになり、列移動を確認しやすいため。

## 4. 想定するディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Board.tsx
│   ├── Column.tsx
│   ├── TaskCard.tsx
│   ├── AddTaskModal.tsx
│   ├── AddTaskForm.tsx
│   └── dnd/            # 当たり判定・キーボード座標など(#12)
├── hooks/
│   └── useTasks.ts
└── lib/
    ├── task/           # 型・列の定義・バリデーション・ID生成・作成/移動(#7・#8)
    ├── storage/        # localStorage の読み書き(#9)
    └── form/           # Enter キーの送信判定(#11)
```

テストファイルは対象と同じディレクトリに `*.test.ts` として置く。

## 5. 初期構築(#6)のセットアップ内容

- `create-next-app` のオプション: TypeScript / Tailwind CSS / ESLint / App Router / `src/` / import alias `@/*` / npm / Turbopack。
    - リポジトリ直下に `README.md`・`CLAUDE.md`・`.claude/`・`docs/` があるため、そのまま実行するとファイルの競合で失敗する可能性が高い。一時ディレクトリで生成して必要なファイルだけ移し、既存ファイルは上書きしない。生成された `AGENTS.md` や `CLAUDE.md` も取り込まない。
    - オプション名はバージョンで変わるため、実行時に `--help` で確認する(Next.js 16 以降は Turbopack が既定)。
- Vitest: `vitest.config.mts` で `environment: "node"`、`include: ["src/**/*.test.ts"]` とし、`@/*` のパスエイリアスを解決する。
    - 6章のテスト対象はすべて純粋ロジックで、localStorage は `Storage` を引数で渡してテストするため、jsdom と Testing Library は導入しない。
- `@dnd-kit/core` を追加する。`@dnd-kit/sortable` は列内の並び替え用でスコープ外のため入れない。
- npm scripts: `dev` / `build` / `start` / `lint` / `test`(`vitest run --passWithNoTests`)/ `test:watch`。
- `package.json` の `engines` で Node.js の要件を `^22.12.0 || ^24.0.0 || >=26.0.0` と明記する(`Intl.Segmenter` と `crypto.randomUUID` を使うため Node 20 以上が前提。そのうえで Vitest 5 の動作要件に合わせる)。

## 6. リスクと対応方針

| リスク | 対応方針 |
| --- | --- |
| キーボード操作で矢印キー1回ごとに隣の列へ移動させる処理(#12)は、dnd-kit 標準のキーボード操作(一定ピクセルずつ移動)では満たせず、独自の座標計算とレイアウト判定が必要になる。 | #12 の実装が大きくなる場合は、マウス・タッチとキーボードでPRを分けてよいことをIssueに明記済み。 |
| `createdAt` の「ISO 8601 として解釈できる」の判定が `Date.parse` だけでは緩すぎる。一方で、不正な日時に対して `toISOString()` を呼ぶと `RangeError` が発生し、読み込み処理が止まる。 | `new Date(s)` が有効な日時であること(`getTime()` が `NaN` でないこと)を先に確認し、そのうえで `toISOString()` の結果が `s` と一致する(往復一致)場合のみ有効と判定する。#9 に明記済みで、`createdAt` が `"abc"` のタスクが例外を出さずに除外されることをテスト観点に含める。 |
| `useTasks` で `useEffect([tasks])` を使って保存すると、読み込み前の空配列で保存データを上書きする恐れがある。 | 保存は追加・移動の操作ハンドラの中で行うことを #10 に明記済み。 |
| #11 と #12 を並行で進めると、共通のファイルでコンフリクトが起きやすい。 | 3章のとおり、先にマージした方を取り込んでからもう一方をマージする。 |
