# poc-aidd-taskboard
タスクボードアプリケーションの開発を通したAI駆動開発(AI-Driven Development)の検証

## アプリケーション概要

未着手 / 進行中 / 保留 / 完了 の4列で構成される、シンプルなカンバン型のタスク管理アプリです。

- タイトルと説明を入力してタスクを作成すると、「未着手」列に追加されます。
- 作成時に、担当者・優先度(高 / 中 / 低)・期限を任意で設定でき、タスクカードに表示されます。
- タスクカードをドラッグ&ドロップで別の列に移動して、ステータスを管理します。
- データはブラウザの localStorage に保存されます(サーバーへの保存・ユーザー認証はありません)。

> 現在は開発中です。進行中の変更は [openspec/changes/](openspec/changes/) と GitHub の Issue を参照してください。

詳しい仕様は [openspec/specs/](openspec/specs/) の capability ごとの仕様を参照してください。

## 技術スタック

| 分類 | 使用技術 |
| --- | --- |
| 言語 | TypeScript 6.0 |
| フレームワーク | Next.js 16(App Router) |
| UI | React 19 |
| スタイリング | Tailwind CSS 4 |
| ビルド/開発サーバー | Turbopack |
| ドラッグ&ドロップ | @dnd-kit/core |
| テスト | Vitest 5、React Testing Library 16(jsdom 28) |
| Lint | ESLint 9(eslint-config-next) |

## 動作環境

- Node.js 22.12 以上の 22 系、24 系、または 26 以上(`package.json` の `engines` で指定。Vitest 5 の動作要件に合わせています)
- npm

## セットアップ

```bash
git clone https://github.com/4Y4T4/poc-aidd-taskboard.git
cd poc-aidd-taskboard
npm ci
```

### OpenSpec の設定

仕様の管理には [OpenSpec](https://github.com/Fission-AI/OpenSpec) を使います。CLI は `devDependencies` にバージョンを固定して入れているため、`npx openspec` で実行します(グローバルへのインストールは不要です)。

Claude Code 向けのスキル(`.claude/skills/openspec-*/`)はリポジトリにコミット済みです。配布形式とワークフローの組は利用者ごとのグローバル設定(`~/.config/openspec/config.json`)に保存されるため、初回に次を実行して、このリポジトリの設定(配布形式は skills のみ、組は core)に合わせてください。グローバル設定の既定は `delivery: both` で、そのまま `openspec update` を実行すると、使っていない `.claude/commands/opsx/` が作られます。

```bash
npx openspec config set delivery skills
npx openspec config profile core
```

CLI のバージョンを上げたときは、`npx openspec update` で生成スキルを作り直し、差分をコミットしてください。

## 起動方法

### 開発サーバー

```bash
npm run dev
```

http://localhost:3000 を開くと、アプリが表示されます。

### 本番ビルド

```bash
npm run build
npm run start
```

## npm scripts

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動する(Turbopack) |
| `npm run build` | 本番用にビルドする |
| `npm run start` | ビルド済みのアプリを起動する(先に `npm run build` が必要) |
| `npm run lint` | ESLint で静的解析する |
| `npm run test` | Vitest でテスト(ロジックとコンポーネント)を1回実行する |
| `npm run test:watch` | Vitest をウォッチモードで起動する |

## ディレクトリ構成

```
.
├── .claude/              # Claude Code の設定(設定ファイル・ルールファイル・サブエージェント・スキル)
├── docs/                 # AIDD の構想
├── openspec/             # OpenSpec の設定・仕様・変更
│   ├── config.yaml       # 仕様を書くときに AI へ渡す前提とルール
│   ├── specs/            # capability ごとの仕様(仕様の正)
│   └── changes/          # 進行中の変更(change)と、アーカイブ済みの変更(archive/)
├── src/
│   ├── app/              # Next.js App Router のページ・レイアウト
│   ├── components/       # ヘッダー・ボード・列・タスクカード・追加モーダル・追加フォーム
│   │   └── dnd/          # ドラッグ&ドロップの当たり判定・キーボード操作の座標・読み上げ文言
│   ├── hooks/            # タスクの状態を扱うフック(useTasks)
│   ├── lib/
│   │   ├── task/         # 列の定義・優先度・バリデーション・ID の生成・作成と移動・ストア
│   │   ├── storage/      # localStorage の読み書き
│   │   └── form/         # Enter キーの送信判定
│   └── types/            # タスクと列の型
├── CLAUDE.md             # Claude Code 向けのプロジェクト指示
├── vitest.config.mts     # Vitest の設定
├── vitest.setup.ts       # コンポーネントのテストの準備(jest-dom・クリーンアップ)
└── package.json
```

テストは対象と同じディレクトリに置きます。ロジックのテストは `*.test.ts`(node で実行)、コンポーネントのテストは `*.test.tsx`(jsdom で実行)です。

## 開発の進め方

- AI 駆動開発(AIDD)の考え方・開発フロー・人と AI の役割分担は [AIDD の構想](docs/aidd-concept.md) を参照してください。
- ブランチ命名・コミットメッセージ(絵文字コミット)のルールは [CLAUDE.md](CLAUDE.md) に従います。
- 仕様の変更は、OpenSpec の change で「提案(`/openspec-propose`)→ Issue の起票(`/create-issue`)→ 実装とアーカイブ(`/implement-issue`)」の順に進めます。
- Claude Code のスキルを使って開発します。スキルは `/スキル名` で呼び出すほか、依頼の内容に合えば AI が自動で使います。
    - `/openspec-explore`: 変更の内容を、提案にする前に AI と考える
    - `/openspec-propose <変更内容>`: change(提案・仕様の差分・設計・作業)を作る
    - `/openspec-update-change`: 作成済みの change を直す
    - `/create-issue <change名 | 起票したい内容>`: このリポジトリの書式に沿って Issue を起票する
    - `/implement-issue <Issue番号>`: Issue の内容を実装し、change をアーカイブして仕様に取り込み、PR を作成する(`/openspec-apply-change`・`/openspec-archive-change` を中で使う)
    - `/taskboard-feature-dev`: 機能を TDD で実装する進め方(`/implement-issue` の実装の手順から使う)
    - `/pr-review <PR番号>`: このリポジトリのルールに基づいて PR をレビューし、PR にコメントする

## 注意事項

- **型チェックはビルドの後に実行する:** `LayoutProps` などの型は Next.js がビルド時に生成します。`npx tsc --noEmit` を単独で実行する場合は、先に `npm run build` か `npx next typegen` を実行してください。
- **AI エージェントから開発サーバーを起動すると `CLAUDE.md` が書き換わる:** Next.js 16 は、AI エージェントの環境で `npm run dev` を実行すると、`CLAUDE.md` の末尾に `<!-- BEGIN:nextjs-agent-rules -->` のブロックを自動で追記します。意図しない変更であれば `git checkout -- CLAUDE.md` で元に戻してください。
