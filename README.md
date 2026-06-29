# Secure Commit — Desktop

A thin Electron shell that opens **https://secureai.one/commit** in a native
desktop window (macOS, Windows, Linux).

## The update model

The app loads the **live** website. That means: deploy secureai.one and every
installed copy shows the new version instantly — no re-download required. You only
rebuild and re-ship this desktop app when you change the *shell itself* (the
window, menus, icon), which is rare.

## Run it (dev)

```bash
npm install
npm start
```

Point it at a different URL while testing:

```bash
SECURE_COMMIT_URL=http://localhost:3000/commit npm start
```

## Build installers

```bash
npm run dist:mac     # .dmg (arm64 + x64)
npm run dist:win     # .exe installer (run on Windows or CI)
npm run dist:linux   # .AppImage + .deb
```

Output lands in `release/`.

### Notes
- **Code signing / notarization** is not set up yet. Unsigned builds run fine for
  personal use; for public distribution you'll want an Apple Developer ID (macOS)
  and a code-signing cert (Windows) so users don't get "unidentified developer"
  warnings.
- Windows/Linux installers are easiest to produce via CI (e.g. GitHub Actions)
  since electron-builder cross-compilation from macOS is limited.
