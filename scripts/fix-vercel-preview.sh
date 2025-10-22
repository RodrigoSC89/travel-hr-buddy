#!/usr/bin/env bash
set -e
rm -rf .vite .vercel node_modules/.vite dist || true
export NODE_OPTIONS="--max-old-space-size=4096"
npm ci || npm install
npm run build -- --force
