import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext"; // Global Cart aur Auth state setup
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Brand name aur description professional set kar di
export const metadata: Metadata = {
  title: "Khushbu-e-Khaas | Luxury Inspired Perfumes",
  description: "Elegance in every spray. Discover premium luxury fragrances crafted for confidence.",
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
      <body className="min-h-full flex flex-col">
        {/* Poori application ko wrap kar diya taake cart aur auth har page par flawlessly chalein */}
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}