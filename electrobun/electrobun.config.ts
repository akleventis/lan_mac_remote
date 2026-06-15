import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Mac Remote",
    identifier: "com.alexleventis.macremote",
    version: "2.0.0",
  },
  runtime: {
    exitOnLastWindowClosed: false,
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    copy: {
      // copy destinations are relative to Contents/Resources/app/ in the bundle
      "../go_binary": "go_binary",
      "src/mainview/index.html": "views/mainview/index.html",
      "src/mainview/icon.png": "views/mainview/icon.png",
    },
    mac: {
      bundleCEF: false,
      icons: "../assets/app.iconset",
    },
  },
} satisfies ElectrobunConfig;
