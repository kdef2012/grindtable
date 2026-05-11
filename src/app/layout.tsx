import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LockScreen } from "@/components/auth/LockScreen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrindTable - Intelligent Restaurant Management",
  description: "Modern, touch-first restaurant floor management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(inter.className, "antialiased bg-background text-foreground h-screen overflow-hidden flex flex-col")}>
        <LockScreen>
          {children}
        </LockScreen>
      </body>
    </html>
  );
}
