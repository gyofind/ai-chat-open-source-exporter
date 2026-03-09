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

# Silent Lint Check: Only speaks up on failure
if ! npm run lint > /dev/null 2>&1; then
  echo "⚠️  NOTE: Lint errors detected in src/. Context may contain syntax issues."
fi

echo "🔍 Gathering project context (High Fidelity)..."

{
  echo "==============================================================="
  echo "PROJECT SUMMARY"
  echo "==============================================================="
  if [ -f "package.json" ]; then
    grep -E '"name"|"version"|"description"' package.json | sed 's/[",]//g'
  fi
  echo "Generated on: $(date)"

  echo -e "\n\n==============================================================="
  echo "CORE CONFIGURATION & DOCUMENTATION"
  echo "==============================================================="
  
  # List of critical config files
  # 1. Package.json with placeholder for devDeps
  if [ -f "package.json" ]; then
    echo -e "\n--- FILE: package.json ---"
    # Remove devDeps, remove the very last '}', then fix the trailing comma
    sed '/"devDependencies": {/,/}/d' package.json | sed '$d' | sed '$ s/$/ ,/' | sed 's/, ,/,/'
    echo -e '  "devDependencies": { /* ... removed for context brevity ... */ }\n}'
  fi

  # 2. Other Configs (Full Fidelity with Documentation Pruning)
  FILES=("manifest.json" "webpack.config.js" "documentation/AI_INSTRUCTIONS.md" "scripts/start-firefox.sh" "scripts/generate-icons.js")
  for file in "${FILES[@]}"; do
    if [ "$file" != "package.json" ] && [ -f "$file" ]; then
      echo -e "\n--- FILE: $file ---"
      
      case "$file" in
        "documentation/AI_INSTRUCTIONS.md")
          if grep -q "## 📄 File Descriptions" "$file"; then
            sed '/## 📄 File Descriptions/,$d' "$file"
            echo -e "## 📄 File Descriptions\n\n/* ... descriptions removed; actual files are provided below in the SOURCE CODE section ... */"
          else
            cat "$file"
          fi
          ;;
        *)
          cat "$file"
          ;;
      esac
    fi
  done
  
  # 3. Optional Sample
  if [ "$INCLUDE_SAMPLE" = true ]; then
    echo -e "\n\n==============================================================="
    echo "LATEST TEST SNAPSHOT SAMPLE"
    echo "==============================================================="
    # Find the most recently modified .md file in the history folder
    LATEST_MD=$(ls -t tests/snapshots/history/*.md 2>/dev/null | head -n 1)
    if [ -n "$LATEST_MD" ]; then
      echo "--- SAMPLE SOURCE: $LATEST_MD ---"
      cat "$LATEST_MD"
    fi
  fi

  echo -e "\n\n==============================================================="
  echo "SOURCE CODE (Full Fidelity - Includes Comments)"
  echo "==============================================================="
  
  # Find all JS and HTML in src (Preserving all comments and empty lines)
  find src -type f \( -name "*.js" -o -name "*.html" \) | while read -r file; do
    echo -e "\n--- FILE: $file ---"
    cat "$file"
  done

} > "$OUTPUT_FILE"

echo "✅ Context generated at $OUTPUT_FILE"

# --- CLIPBOARD LOGIC ---
OS_NAME="Unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    cat "$OUTPUT_FILE" | pbcopy
    OS_NAME="MacOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xclip >/dev/null; then cat "$OUTPUT_FILE" | xclip -selection clipboard; OS_NAME="Linux (xclip)";
    elif command -v xsel >/dev/null; then cat "$OUTPUT_FILE" | xsel --clipboard --input; OS_NAME="Linux (xsel)"; fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    cat "$OUTPUT_FILE" | clip.exe
    OS_NAME="Windows"
fi

# --- TOKEN ESTIMATION & WARNING ---
CHAR_COUNT=$(wc -c < "$OUTPUT_FILE")
# Rough estimate: 4 chars per token
TOKEN_EST=$((CHAR_COUNT / 4))
TOKEN_LIMIT=30000 

echo "---------------------------------------------------------------"
echo "📊 Context Stats:"
echo "   - Mode: $([ "$INCLUDE_SAMPLE" = true ] && echo "with sample" || echo "standard")"
echo "   - Characters: $CHAR_COUNT"
echo "   - Est. Tokens: ~$TOKEN_EST"

if [ "$TOKEN_EST" -gt "$TOKEN_LIMIT" ]; then
    echo "⚠️  WARNING: Context is large ($TOKEN_EST tokens)."
    echo "   Consider removing old snapshots or pruning documentation."
else
    echo "✅ Token count is well within the safety limit."
fi

echo "✅ Copied to $OS_NAME clipboard."
echo "---------------------------------------------------------------"