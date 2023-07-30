import "@/styles/globals.css";

import React from "react";
import { Metadata } from "next";

import { cn } from "@ssb/ui/utils";

import { fontSans } from "@/lib/fonts";

import { SessionProvider } from "./SessionProvider";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "SSB",
      template: "%s | SSB",
    },
    description: "Simple Standup Bot",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "white" },
      { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      locale: "en_US",
      type: "website",
      siteName: "SSB",
      title: "SSB",
      description: "Simple Standup Bot",
      images: [
        {
          url: "/api/cms/og",
          width: 1200,
          height: 630,
        },
      ],
    },
    // the manifest will 401 in vercel preview environments and generate repeating console errors
    ...(process.env.NODE_ENV === "production"
      ? { manifest: "/webmanifest.json" }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@900&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "flex min-h-screen flex-col overflow-x-hidden bg-background font-sans antialiased ",
          fontSans.variable,
        )}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
