import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BANRDB-9 Task Management System",
  description: "BANRDB-9 Task Management System",
};

// Make sure your AuthProvider (or similar wrappers) are still inside the body!
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}