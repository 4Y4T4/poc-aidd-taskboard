---
description: このリポジトリ固有のルールに基づいてPRレビューを行う
argument-hint: "[PR番号 | ブランチ名 | 省略で現在のブランチ]"
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr checks:*), Bash(gh pr comment:*), Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git rev-parse:*), Bash(git fetch:*), Bash(git show:*), Read, Grep, Glob
---

あなたはこのリポジトリのレビュー担当です。以下の手順でPRレビューを行い、レビュー結果を対象のPRにコメントしてください。
コードの修正は行わず、レビューと指摘事項の洗い出しに専念してください。

## 1. レビュー対象の特定

引数: `$ARGUMENTS`

- 引数が数値(PR番号)の場合: `gh pr view $ARGUMENTS --json title,body,baseRefName,headRefName,files` と `gh pr diff $ARGUMENTS` で概要と差分を取得する。
- 引数がブランチ名の場合: そのブランチと `main` との差分を `git diff main...<ブランチ名>` で取得する。
- 引数が省略された場合: 現在のブランチと `main` との差分を `git diff main...HEAD` で取得する(`git status` で作業ツリーの状態も確認する)。
- 対象が見つからない、diffが空の場合はその旨を報告して終了する。

## 2. レビューの観点

コーディングルールは `.claude/rules/` にまとめている。差分を見る前に、次のルールファイルを読み、差分がルールに沿っているかを確認する。

ルールファイルは、作業ツリーではなくレビュー対象の版を読む。作業ツリーが別のブランチだったり、レビュー対象のPR自身がルールファイルを変更していたりすると、内容が食い違うため。差分の前後のコードを読むときも同じ版を使う。

- 引数が PR 番号の場合: `git fetch origin <headRefName>` のあと、`git show origin/<headRefName>:<パス>` で読む。
- 引数がブランチ名の場合: `git show <ブランチ名>:<パス>` で読む。
- 引数が省略された場合: 作業ツリーのファイルを Read で読む。

| 変更されたファイル | 読むルールファイル |
| --- | --- |
| すべて | `.claude/rules/general.md` |
| `*.ts`・`*.tsx`・`*.mts` | `.claude/rules/typescript.md` |
| `src/components/**`・`src/app/**`・`src/hooks/**` | `.claude/rules/components.md` |
| `src/lib/**` | `.claude/rules/task-logic.md` |
| `src/**/*.test.ts` | `.claude/rules/testing.md` |

ルールファイルに加えて、一般的な正しさ(バグ・エッジケース・エラーハンドリングの過不足)も確認する。

## 3. 指摘の作法

- 指摘には必ず具体的なファイルパスと行番号を伴わせる。根拠のない曖昧な指摘はしない。
- ルールファイルに基づく指摘には、根拠にしたルールファイル名を添える。
- 重要度(高/中/低)を明記する。
- 可能であれば簡潔な修正案を添える。
- 良い点があれば併せて挙げる。
- 指摘事項が一つもない場合は「指摘事項なし」と明記する。

## 4. 出力フォーマット

以下の構成で日本語で出力する。指摘がない観点は省略してよい。

```
## PRレビュー結果: <対象>

### 概要
<変更内容の要約 1-3行>

### 指摘事項
- [重要度: 高/中/低] <ファイルパス:行番号> — <指摘内容と理由>
  修正案: <あれば>

### 良い点
- <あれば箇条書きで>

### 総評
<マージ可否の所感を1-2文で>
```
