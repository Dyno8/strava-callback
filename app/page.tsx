export default function Home() {
  const oauthBridgeEnabled = (() => {
    const value = process.env.BOT_OAUTH_ENABLED ?? "true";
    return !["0", "false", "no", "off"].includes(value.trim().toLowerCase());
  })();

  const message = oauthBridgeEnabled
    ? "This service completes the Strava OAuth flow automatically. Once you approve the request you can close this tab—check Telegram for confirmation."
    : "After approving access, you will land on a page showing your authorization code. Copy the code and send it to the Telegram bot using /login YOUR_CODE.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "0.75rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Strava OAuth Callback</h1>
      <p style={{ fontSize: "1rem", color: "#4b5563", lineHeight: 1.6 }}>{message}</p>
    </main>
  );
}
