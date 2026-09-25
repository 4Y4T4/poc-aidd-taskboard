# poc-aidd-taskboard
タスクボードアプリケーションの開発を通したAI駆動開発(AI-Driven Development)の検証

## アプリケーション概要

未着手 / 進行中 / 完了 の3列で構成される、シンプルなカンバン型のタスク管理アプリです。

- タイトルと説明を入力してタスクを作成すると、「未着手」列に追加されます。
- タスクカードをドラッグ&ドロップで別の列に移動して、ステータスを管理します。
- データはブラウザの localStorage に保存されます(サーバーへの保存・ユーザー認証はありません)。

> 現在は開発中です。各機能の進み具合は [実行計画](docs/execution-plan.md) と GitHub の Issue を参照してください。

詳しい仕様は [要件定義書](docs/requirements.md) を参照してください。

## 技術スタック

| 分類 | 使用技術 |
| --- | --- |
| 言語 | TypeScript 6.0 |
| フレームワーク | Next.js 16(App Router) |
| UI | React 19 |
| スタイリング | Tailwind CSS 4 |
| ビルド/開発サーバー | Turbopack |
| ドラッグ&ドロップ | @dnd-kit/core |
| テスト | Vitest 5 |
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
| `npm run test` | Vitest でユニットテストを1回実行する |
| `npm run test:watch` | Vitest をウォッチモードで起動する |

## ディレクトリ構成

```
.
├── .claude/          # Claude Code の設定(サブエージェント・カスタムコマンド)
├── docs/             # 要件定義書・実行計画
├── src/
│   └── app/          # Next.js App Router のページ・レイアウト
├── CLAUDE.md         # Claude Code 向けのプロジェクト指示
├── vitest.config.mts # Vitest の設定
└── package.json
```

コンポーネント・ロジックの配置予定は [実行計画の4章](docs/execution-plan.md#4-想定するディレクトリ構成) を参照してください。ユニットテストは対象と同じディレクトリに `*.test.ts` として置きます。

## 開発の進め方

- ブランチ命名・コミットメッセージ(絵文字コミット)のルールは [CLAUDE.md](CLAUDE.md) に従います。
- Claude Code のカスタムコマンドを使って開発します。
    - `/implement-issue <Issue番号>`: Issue の内容を実装し、PR を作成する
    - `/pr-review <PR番号>`: このリポジトリのルールに基づいて PR をレビューし、PR にコメントする

## 注意事項

- **型チェックはビルドの後に実行する:** `LayoutProps` などの型は Next.js がビルド時に生成します。`npx tsc --noEmit` を単独で実行する場合は、先に `npm run build` か `npx next typegen` を実行してください。
- **AI エージェントから開発サーバーを起動すると `CLAUDE.md` が書き換わる:** Next.js 16 は、AI エージェントの環境で `npm run dev` を実行すると、`CLAUDE.md` の末尾に `<!-- BEGIN:nextjs-agent-rules -->` のブロックを自動で追記します。意図しない変更であれば `git checkout -- CLAUDE.md` で元に戻してください。
