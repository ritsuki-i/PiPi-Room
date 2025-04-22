// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PiPi Room",
  description: "ユーザが作品や記事を投稿し、管理できるプラットフォーム",
  openGraph: {
    title: "PiPi Room",
    description: "ユーザが作品や記事を投稿し、管理できるプラットフォーム",
    url: "https://pi-pi-room.vercel.app/",
    type: "website",
    siteName: "PiPi Room",
    locale: "ja_JP",
    images: [
      {
        url: "/images/roomBackground.png",
        width: 1200,
        height: 630,
        alt: "PiPi Room のプレビュー画像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // site や creator は必要に応じて
    // site: "@YourTwitterAccount",
    // creator: "@YourTwitterAccount",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ja" prefix="og: http://ogp.me/ns#">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
