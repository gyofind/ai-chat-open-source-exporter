#!/bin/bash

# Ensure we are in the project root
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR" || exit

# Define the hidden temp directory and file
TMP_DIR=".tmp"
OUTPUT_FILE="$TMP_DIR/project_context.txt"

# Create .tmp if it doesn't exist
mkdir -p "$TMP_DIR"

echo "🔍 Gathering project context from: $ROOT_DIR"

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

  echo -e "\n\n==============================================================="
  echo "SOURCE CODE (Logic & Scrapers)"
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
echo "📋 Copying to clipboard..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # MacOS
    cat "$OUTPUT_FILE" | pbcopy
    echo "✔ Copied to MacOS clipboard."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux (requires xclip or xsel)
    if command -v xclip >/dev/null; then
        cat "$OUTPUT_FILE" | xclip -selection clipboard
        echo "✔ Copied to Linux clipboard (via xclip)."
    elif command -v xsel >/dev/null; then
        cat "$OUTPUT_FILE" | xsel --clipboard --input
        echo "✔ Copied to Linux clipboard (via xsel)."
    else
        echo "❌ Error: Install 'xclip' or 'xsel' to use clipboard on Linux."
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash / WSL)
    cat "$OUTPUT_FILE" | clip.exe
    echo "✔ Copied to Windows clipboard."
else
    echo "⚠️  Unknown OS. Please manually copy: $OUTPUT_FILE"
fi