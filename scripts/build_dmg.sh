#!/bin/bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.."; pwd)"
APP_NAME="Mac Remote"
ELECTROBUN_DIR="$REPO/electrobun"

# build Next.js, embed into go_binary, compile go_binary
"$REPO/scripts/build_app.sh"

# package electrobun app (go_binary has client baked in, no post-processing needed)
cd "$ELECTROBUN_DIR"
bun install
bun run build

# find the built .app bundle (skip dev builds)
APP_PATH=$(find "$ELECTROBUN_DIR/build" -name "*.app" -maxdepth 3 | grep "stable-" | head -1)
if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "Error: release .app bundle not found in $ELECTROBUN_DIR/build"
  exit 1
fi
echo "Found app bundle: $APP_PATH"

# stage and create DMG
DMG_STAGING="$ELECTROBUN_DIR/build/dmg"
DMG_PATH="$REPO/$APP_NAME.dmg"
rm -rf "$DMG_STAGING"
mkdir -p "$DMG_STAGING"
cp -R "$APP_PATH" "$DMG_STAGING/"
ln -s /Applications "$DMG_STAGING/Applications"

hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_STAGING" -ov -format UDZO "$DMG_PATH"

echo "DMG created at: $DMG_PATH"
