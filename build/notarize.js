// electron-builder afterSign hook: notarize the macOS app — but only when the
// Apple credentials are present. With no creds (the default / unsigned build),
// it logs and skips, so the pipeline never breaks. Drop the APPLE_* GitHub
// secrets in and notarization turns on automatically with no code change.
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  if (context.electronPlatformName !== "darwin") return;

  const { APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID } = process.env;
  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD || !APPLE_TEAM_ID) {
    console.log("• notarize: skipped (APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID not set)");
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.log(`• notarize: submitting ${appName}.app to Apple…`);
  await notarize({
    appPath: `${context.appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
    teamId: APPLE_TEAM_ID,
  });
  console.log("• notarize: done");
};
