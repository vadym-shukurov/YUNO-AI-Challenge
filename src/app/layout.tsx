import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "./providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Yuno · Payment Orchestration",
  description:
    "Monitor processor health, routing performance, and anomalies across your Indonesian payment stack.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="flex-1 space-y-6 p-4 lg:p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
