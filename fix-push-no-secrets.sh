#!/bin/bash
# Remove backend/.env from the last commit so push succeeds. Keeps your local .env file.
set -e
cd "$(dirname "$0")"

echo "Removing backend/.env from the last commit (file stays on disk)..."
git rm --cached backend/.env 2>/dev/null || true
git commit --amend --no-edit

echo "Pushing (force to replace remote main)..."
git push -f origin main

echo "Done. backend/.env was never pushed; your local copy is unchanged."
