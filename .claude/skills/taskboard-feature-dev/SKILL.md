---
name: taskboard-feature-dev
description: TaskBoardに新機能をTDDで追加する時に使用する。失敗するテストを先に書き、状態管理を整え、UIを更新し、最後にブラウザで動作確認するまで一貫した手順で進める。
---
TaskBoardに機能を追加するときは、以下の手順で進める。

1. 追加する機能のスコープとユーザー操作を確認する
    - `docs/requirements.md` と `docs/execution-plan.md` を読む。
    - `docs/requirements.md` 7章のスコープ外に当たる場合は、作業に入らずその旨を伝えて進め方を確認する。
2. 失敗するテストを先に追加する
    - `.claude/rules/testing.md` に従って書く。
    - テストを実行し、実装がないことが理由で失敗することを確かめる。
3. ロジックを `src/lib/` の純粋関数に追加し、`useTasks` からはその関数を呼ぶだけにする
    - `.claude/rules/task-logic.md` に従う。
4. 既存コンポーネントの責務分担を変えずにUIを更新する
    - `.claude/rules/components.md` に従う。
5. 次の順に実行し、すべて成功することを確認する(型はビルド時に生成されるため、型チェックはビルドの後に行う)
    1. `npm run build`
    2. `npx tsc --noEmit`
    3. `npm run lint`
    4. `npm test`
    - 追加したテストは、実装を一時的に壊すと失敗することを確かめ、元に戻す。
6. 必要に応じてPlaywright MCPで画面操作を確認する
    - `next dev` ではなく、`npm run build` の後に `npx next start` で起動する。
    - 確認後はサーバーを停止し、`git status` で意図しない変更(CLAUDE.md への追記など)がないことを確認する。
