import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracky",
  description: "Track and manage your 90-day transformation plan",
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

