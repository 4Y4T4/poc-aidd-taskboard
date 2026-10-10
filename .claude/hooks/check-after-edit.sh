#!/usr/bin/env bash
changed_file="$(jq -r '.tool_input.file_path // empty')"

case "$changed_file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# フックはプロジェクトのルート以外で実行されることがあり、npm が package.json を見つけられなくなるため
cd "$CLAUDE_PROJECT_DIR" || exit 0

# PostToolUse では標準出力と exit 1 が Claude に届かず、失敗しても修正されないため、標準エラーと exit 2 で返す
if ! { npm run lint && npm test; } >&2; then
  exit 2
fi
