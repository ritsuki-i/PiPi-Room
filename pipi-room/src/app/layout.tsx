import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster"
import { Html } from 'next/document'

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
  description: "Archive of works created by PiedPiper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Html lang="ja" prefix="og: http://ogp.me/ns#">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header/>
          {children}
          <Toaster />
        </body>
      </Html>
    </ClerkProvider>
  );
}
