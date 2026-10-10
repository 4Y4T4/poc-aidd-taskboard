#!/usr/bin/env bash

changed_file="$(jq -r '.tool_input.file_path // empty')"

case "$changed_file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# フックはプロジェクトのルート以外で実行されることがあり、npm が package.json を見つけられなくなるため
cd "$CLAUDE_PROJECT_DIR" || exit 0

# 編集のたびにプロジェクト全体を検査すると、続けて編集するときやテストが増えたときに待ち時間が積み上がるため、編集したファイルに関係する範囲に絞る
# PostToolUse では標準出力と exit 1 が Claude に届かず、失敗しても修正されないため、標準エラーと exit 2 で返す
if ! { npx eslint "$changed_file" && npx vitest related --run --passWithNoTests "$changed_file"; } >&2; then
  exit 2
fi
