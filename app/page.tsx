export default function Home() {
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
    </main>
  );
}
