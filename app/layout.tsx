import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import DashboardLayout from "@/components/DashboardLayout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hivepod.vercel.app"),
  title: "HivePod - Learning & Podcasting Platform",
  description: "A premium platform for creators to share courses, host audio lectures, and build communities.",
  applicationName: "HivePod",
  keywords: ["Learning", "Courses", "Podcasting", "Audio Lectures", "Community"],
  openGraph: {
    title: "HivePod - Learning & Podcasting Platform",
    description: "A premium platform for creators to share courses, host audio lectures, and build communities.",
    siteName: "HivePod",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HivePod - Learning & Podcasting Platform",
    description: "A premium platform for creators to share courses, host audio lectures, and build communities.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
