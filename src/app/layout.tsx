import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TasksProvider } from "@/store/TasksProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StepWise Planner",
  description: "Розкажи, що зараз відбувається: плани, сумніви, хаос упереміш. Glow розкладе це на чіткі кроки і збере план на сьогодні.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TasksProvider>{children}</TasksProvider>
      </body>
    </html>
  );
}
