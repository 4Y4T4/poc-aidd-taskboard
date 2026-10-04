#!/usr/bin/env bash
# Claude Code の Stop フック: 応答が終わったら Windows のデスクトップにトースト通知を出す(WSL 用)。
# powershell.exe がない環境(WSL 以外)では何もしない。
command -v powershell.exe >/dev/null 2>&1 || exit 0

project="$(basename "${CLAUDE_PROJECT_DIR:-$PWD}")"
# PowerShell の単一引用符の文字列に埋め込むため、' を '' にする
project="${project//\'/\'\'}"

# 外部モジュールを使わず、PowerShell 自身のアプリ ID で通知を出す
powershell.exe -NoProfile -NonInteractive -Command "
\$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
\$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
\$texts = \$xml.GetElementsByTagName('text')
\$null = \$texts.Item(0).AppendChild(\$xml.CreateTextNode('Claude Code'))
\$null = \$texts.Item(1).AppendChild(\$xml.CreateTextNode('${project}: 処理が完了しました'))
\$toast = [Windows.UI.Notifications.ToastNotification]::new(\$xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe').Show(\$toast)
" >/dev/null 2>&1 || true
