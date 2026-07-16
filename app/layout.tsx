import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import DashboardLayout from "@/components/DashboardLayout";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#121212",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hivepod.vercel.app"),
  title: "HivePod - Learning & Podcasting Platform",
  description: "A premium, state-of-the-art platform for creators to share courses, host audio lectures, and build thriving communities.",
  applicationName: "HivePod",
  keywords: ["Learning", "Courses", "Podcasting", "Audio Lectures", "Community", "Creator Economy", "Education", "HivePod"],
  openGraph: {
    title: "HivePod - Learning & Podcasting Platform",
    description: "A premium, state-of-the-art platform for creators to share courses, host audio lectures, and build thriving communities.",
    siteName: "HivePod",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HivePod - Learning & Podcasting Platform",
    description: "A premium, state-of-the-art platform for creators to share courses, host audio lectures, and build thriving communities.",
    images: ["/banner.png"],
  },
};

import { BackgroundTasksProvider } from "@/components/BackgroundTasksProvider";
import GlobalProgressUI from "@/components/GlobalProgressUI";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased selection:bg-[#3f3f46] selection:text-white"
    >
      <body suppressHydrationWarning className={`min-h-full flex flex-col bg-background text-foreground ${inter.className}`}>
        <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "63eab370ca37427a9924420a960e83e4"}' />
        <AuthProvider>
          <BackgroundTasksProvider>
            <DashboardLayout>
              {children}
              <Analytics />
            </DashboardLayout>
            <GlobalProgressUI />
          </BackgroundTasksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
