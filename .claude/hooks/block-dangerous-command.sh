#!/usr/bin/env bash

command="$(jq -r '.tool_input.command // empty')"

# 取り返しのつかない削除・履歴の上書き・権限昇格を、確認なしで実行させないため
block() {
  # exit 2 と標準エラーにしないと、止めた理由が Claude に届かないため
  echo "危険なコマンドのため実行を止めました: $command" >&2
  if [ "$1" != "" ]; then
    echo "$1" >&2
  fi
  exit 2
}

# echo だとコマンドが -n や -e で始まるときにオプションとして解釈されるため、printf で渡す
matches() {
  printf '%s\n' "$1" | grep -Eq "$2"
}

# コマンドから rm や git push の呼び出しを ; & | の手前まで切り出す
# 切り出さないと、別のコマンドのオプションを rm や git push のものと取り違えるため
segments() {
  printf '%s\n' "$command" | grep -oE "$1"
}

# sudo は単語として区切らないと、sudoku など sudo を含むだけの語でも止まるため
if matches "$command" '(^|[;&|[:space:]])sudo([[:space:]]|$)'; then
  block
fi

# -rf だけを見ると -fr・-r -f・--recursive --force などの書き方ですり抜けるため、再帰と強制の指定を別々に探す
while IFS= read -r segment; do
  if matches "$segment" '[[:space:]](-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)([[:space:]]|$)' \
    && matches "$segment" '[[:space:]](-[a-zA-Z]*f[a-zA-Z]*|--force)([[:space:]]|$)'; then
    block
  fi
done < <(segments '(^|[;&|[:space:]])rm[[:space:]][^;&|]*')

# --force は push の直後とは限らず、-f や refspec の先頭の + でも強制 push になるため
while IFS= read -r segment; do
  if matches "$segment" '[[:space:]](--force[^[:space:]]*|-[a-zA-Z]*f[a-zA-Z]*|\+[^[:space:]]+)([[:space:]]|$)'; then
    block "force push は人が実行します。必要な場合はユーザーに実行を依頼してください。"
  fi
done < <(segments '(^|[;&|[:space:]])git[[:space:]]+push([[:space:]][^;&|]*)?')
