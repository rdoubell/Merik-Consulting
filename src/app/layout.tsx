import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MERIK | Fast, Affordable Micro Loans in South Africa",
  description:
    "Apply online in minutes for short-term loans between R200 and R2,000. Fast, secure, and responsible lending from MERIK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
