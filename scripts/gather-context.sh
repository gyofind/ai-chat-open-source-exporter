#!/bin/bash

# Ensure we are in the project root
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR" || exit

TMP_DIR=".tmp"
OUTPUT_FILE="$TMP_DIR/project_context.txt"
INCLUDE_SAMPLE=false

# Check for -s or --sample flags
for arg in "$@"; do
  if [ "$arg" == "-s" ] || [ "$arg" == "--sample" ]; then
    INCLUDE_SAMPLE=true
  fi
done

mkdir -p "$TMP_DIR"

echo "🔍 Gathering project context..."

{
  echo "==============================================================="
  echo "PROJECT STRUCTURE"
  echo "==============================================================="
  ls -R | grep -v 'node_modules' | grep -v 'dist' | grep -v 'history' | grep -v '.git' | grep -v '.tmp'
  
  echo -e "\n\n==============================================================="
  echo "CORE CONFIGURATION & DOCUMENTATION"
  echo "==============================================================="
  
  # List of critical config files
  FILES=(
    "manifest.json" 
    "package.json" 
    "webpack.config.js" 
    "documentation/AI_INSTRUCTIONS.md" 
    "scripts/start-firefox.sh"
    "scripts/generate-icons.js"
  )

  for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
      echo -e "\n--- FILE: $file ---"
      cat "$file"
    fi
  done

  # Optional Sample Logic
  if [ "$INCLUDE_SAMPLE" = true ]; then
    echo -e "\n\n==============================================================="
    echo "LATEST TEST SNAPSHOT SAMPLE"
    echo "==============================================================="
    # Find the most recently modified .md file in the history folder
    LATEST_MD=$(ls -t tests/snapshots/history/*.md 2>/dev/null | head -n 1)
    if [ -n "$LATEST_MD" ]; then
      echo "--- SAMPLE SOURCE: $LATEST_MD ---"
      cat "$LATEST_MD"
    else
      echo "--- No sample markdown found in tests/snapshots/history/ ---"
    fi
  fi

  echo -e "\n\n==============================================================="
  echo "SOURCE CODE"
  echo "==============================================================="
  find src -name "*.js" | while read -r file; do
    echo -e "\n--- FILE: $file ---"
    cat "$file"
  done

  if [ -f "src/popup/popup.html" ]; then
    echo -e "\n--- FILE: src/popup/popup.html ---"
    cat "src/popup/popup.html"
  fi

} > "$OUTPUT_FILE"

echo "✅ Context generated at $OUTPUT_FILE"

# --- CLIPBOARD LOGIC ---
if [[ "$OSTYPE" == "darwin"* ]]; then
    cat "$OUTPUT_FILE" | pbcopy
    STR="MacOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xclip >/dev/null; then cat "$OUTPUT_FILE" | xclip -selection clipboard; STR="Linux (xclip)";
    elif command -v xsel >/dev/null; then cat "$OUTPUT_FILE" | xsel --clipboard --input; STR="Linux (xsel)"; fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    cat "$OUTPUT_FILE" | clip.exe
    STR="Windows"
fi

echo "✅ Context ($([ "$INCLUDE_SAMPLE" = true ] && echo "with sample" || echo "standard")) copied to $STR clipboard."