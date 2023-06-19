import "@/styles/globals.css";

import React from "react";
import { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { cn } from "@ssb/ui/utils";

import { ThemeProvider } from "@/components/ThemeProvider";
import { fontSans } from "@/lib/fonts";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "SSB",
      template: "%s | SSB",
    },
    description: "Slack Standup Bot",
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
      description: "Slack Standup Bot",
      images: [
        {
          url: "/api/cms/og",
          width: 1200,
          height: 630,
        },
      ],
    },
    // the manifest will 401 in vercel preview environments and generate repeating console errors
    ...(process.env.VERCEL_ENV === "production"
      ? { manifest: "/webmanifest.json" }
      : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "flex min-h-screen flex-col bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ClerkProvider
          signInUrl={`/auth/sign-in`}
          signUpUrl={`/auth/sign-in`}
          afterSignInUrl={`/`}
          afterSignUpUrl={`/`}
        >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <SiteHeader />
              <div className="relative flex flex-1 flex-col">{children}</div>
              <SiteFooter />
            </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
