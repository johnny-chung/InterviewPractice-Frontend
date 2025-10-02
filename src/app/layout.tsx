import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth/auth";
import { AuthProvider } from "@/components/providers/session-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Layer1 Console",
  description:
    "Manage uploads, matches, and subscriptions for Self-Interview AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider session={session}>
          <RealtimeProvider>{children}</RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
