#!/bin/bash
# ファイル編集後に Prettier で自動フォーマット
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# TS/TSX/CSS/JSON のみ対象
if [[ "$FILE_PATH" =~ \.(ts|tsx|css|json)$ ]]; then
  npx prettier --write --log-level=error "$FILE_PATH" 2>&1
fi

exit 0
