import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceIntel - Voice Intelligence App",
  description: "Voice-to-Text mit KI-Enrichment für Desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
