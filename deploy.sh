#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Deploying LUMINA CMS"

# 1. Push backend code to server (adjust host/user/path)
# echo "==> Syncing backend to server..."
# rsync -avz --exclude=venv --exclude=.git --exclude=static . user@server:/opt/lumina-cms/

# 2. Deploy static frontend to Cloudflare Pages
echo "==> Deploying static frontend to Cloudflare Pages..."
npx wrangler pages deploy static --project-name=lumina-cms

echo "==> Done."
