#!/bin/bash
set -euo pipefail

# repo root
REPO="$(cd "$(dirname "$0")/.."; pwd)"

APP_NAME="Mac Remote"
ELECTRON_DIR="$REPO/electron"
DIST_DIR="$ELECTRON_DIR/dist"
APP_DIR="$DIST_DIR/$APP_NAME-darwin-arm64"
APP_PATH="$APP_DIR/$APP_NAME.app"
DMG_STAGING="$DIST_DIR/dmg"
DMG_PATH="$REPO/$APP_NAME.dmg"

# build frontend + go binary
"$REPO/scripts/build_app.sh"

# package electron app (includes go_binary in Resources)
cd "$ELECTRON_DIR"
npm install
npm run package

# verify .app exists
if [ ! -d "$APP_PATH" ]; then
  echo "Error: $APP_PATH not found."
  exit 1
fi

# ensure Next.js static export is bundled where server expects it
CLIENT_OUT="$REPO/client/out"
RESOURCES_CLIENT_DIR="$APP_PATH/Contents/Resources/client"
if [ ! -d "$CLIENT_OUT" ]; then
  echo "Error: Next.js export not found at $CLIENT_OUT. Run build_client.sh or build_app.sh first."
  exit 1
fi
mkdir -p "$RESOURCES_CLIENT_DIR"
rm -rf "$RESOURCES_CLIENT_DIR/out"
cp -R "$CLIENT_OUT" "$RESOURCES_CLIENT_DIR/out"

# stage DMG content
rm -rf "$DMG_STAGING"
mkdir -p "$DMG_STAGING"
cp -R "$APP_PATH" "$DMG_STAGING/"
ln -s /Applications "$DMG_STAGING/Applications"

# create compressed DMG
hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_STAGING" -ov -format UDZO "$DMG_PATH"

echo "DMG created at: $DMG_PATH"