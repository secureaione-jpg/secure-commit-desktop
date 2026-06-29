# Code signing & notarization

The release pipeline signs and notarizes **automatically** once the secrets
below exist in this repo (Settings → Secrets and variables → Actions). Until
then it builds **unsigned** and everything else still works.

## macOS (Apple Developer Program, $99/yr)

1. In Xcode or the Apple Developer portal, create a **Developer ID Application**
   certificate and export it as a `.p12` (set an export password).
2. Base64-encode it:
   ```bash
   base64 -i DeveloperIDApplication.p12 | pbcopy
   ```
3. Add repo secrets:
   - `MAC_CSC_LINK` — the base64 string from step 2
   - `MAC_CSC_KEY_PASSWORD` — the `.p12` export password
   - `APPLE_ID` — your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — an app-specific password
     (appleid.apple.com → Sign-In and Security → App-Specific Passwords)
   - `APPLE_TEAM_ID` — your 10-character Team ID (Apple Developer → Membership)

## Windows

1. Obtain a code-signing certificate (`.pfx`/`.p12`). OV works; EV builds
   SmartScreen reputation faster.
2. Base64-encode it (`base64 -i cert.pfx`).
3. Add repo secrets:
   - `WIN_CSC_LINK` — the base64 string
   - `WIN_CSC_KEY_PASSWORD` — the certificate password

## That's it

Push a version tag (`git tag v0.1.4 && git push origin v0.1.4`) and the next
release is signed + notarized. No workflow edits required — the build reads
these secrets and `build/notarize.js` activates when the `APPLE_*` values are
present.
