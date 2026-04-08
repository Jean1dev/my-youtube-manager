import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavTabs } from "@/components/NavTabs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube RSS Manager",
  description: "Gerencie vídeos do YouTube RSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                YouTube RSS
              </h1>
              <NavTabs />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
