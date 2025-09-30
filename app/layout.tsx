import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strava OAuth Callback",
  description: "Completes the Strava OAuth flow for the Strava Telegram Bot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
