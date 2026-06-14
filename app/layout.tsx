import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medical Report Analyzer",
  description: "AI-powered diagnostic lab report analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${ibmPlexSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
