---
description: TaskBoardの機能をTDDで実装するときの進め方。失敗するテストを先に書き、ロジック・UIの順に実装して、テストが通るまでを一貫した手順で進める。Issueの実装(implement-issue)の手順3で使う。
---
TaskBoardの機能をTDDで実装するときは、以下の手順で進める。

このスキルはコードの実装だけを扱う。ブランチの作成・コミット・ビルドなどの確認・画面確認・PR の作成は `implement-issue` の手順で行う。このスキルを単独で使う場合も、作業前に CLAUDE.md のブランチルールに従ってブランチを切る。

1. 追加する機能のユーザー操作を確認する
    - Issue の完了条件と `docs/requirements.md` の該当章から、ユーザーの操作と期待する結果を洗い出す。
    - `docs/requirements.md` 7章のスコープ外に当たる操作は追加しない。
2. 失敗するテストを先に追加する
    - `.claude/rules/testing.md` に従って書く。
    - テストを実行し、実装がないことが理由で失敗することを確かめる。
3. ロジックの追加・変更が必要な場合は、`src/lib/` の純粋関数に追加し、`useTasks` からはその関数を呼ぶだけにする
    - `.claude/rules/task-logic.md` に従う。
4. 既存コンポーネントの責務分担を変えずにUIを更新する
    - `.claude/rules/components.md` に従う。
5. `npm test` を実行し、追加したテストを含めてすべて通ることを確かめる
