#!/bin/bash
# Double-click to run the Yeti Insurance site locally on a Mac.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Download the LTS version from https://nodejs.org, install it, then double-click this file again."
  open "https://nodejs.org/en/download"
  read -p "Press Enter to close..."
  exit 1
fi
node build.js || { read -p "Build failed. Press Enter to close..."; exit 1; }
( sleep 1 && open "http://localhost:8080" ) &
node serve.js --watch
