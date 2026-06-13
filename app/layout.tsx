import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import DashboardLayout from "@/components/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
