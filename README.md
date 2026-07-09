# Secure AI — Desktop

Electron shell that loads `https://secureai.one/chat`. Deploying the website updates every installed copy instantly.

## Dev
```bash
npm install
npm start
# Point at local:
SECUREAI_URL=http://localhost:3000/chat npm start
```

## Release
```bash
git tag v0.1.0 && git push origin v0.1.0
```
CI builds mac/win/linux and publishes to GitHub Releases. See `SIGNING.md` for code signing.
