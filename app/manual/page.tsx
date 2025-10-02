"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function normalizeCode(raw: string | null): string {
  return raw?.trim() ?? "";
}

export default function ManualCallbackPage() {
  const searchParams = useSearchParams();
  const code = normalizeCode(searchParams.get("code"));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const heading = code ? "Authorization code received" : "No authorization code found";
  const helperText = code
    ? "Copy the code below and send it to the Telegram bot with /login YOUR_CODE."
    : "Try the Strava login again to obtain a fresh authorization code.";

  async function handleCopy() {
    if (!code) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "1.5rem",
        textAlign: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.1)",
          maxWidth: "28rem",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.75rem" }}>{heading}</h1>
        <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>{helperText}</p>
        <input
          type="text"
          readOnly
          value={code || ""}
          aria-label="Authorization code"
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #d1d5db",
            backgroundColor: code ? "#f3f4f6" : "#fee2e2",
            color: code ? "#111827" : "#b91c1c",
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!code}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "0.75rem",
            border: "none",
            cursor: code ? "pointer" : "not-allowed",
            backgroundColor: code ? "#ef4444" : "#f87171",
            color: "white",
            transition: "background-color 150ms ease",
          }}
        >
          {copyState === "copied" && "Copied!"}
          {copyState === "failed" && "Copy failed"}
          {copyState === "idle" && "Copy code"}
        </button>
        <p style={{ marginTop: "1.5rem", color: "#6b7280", fontSize: "0.9rem" }}>
          Once you send the code to Telegram, we will connect your Strava account.
        </p>
      </div>
    </main>
  );
}
