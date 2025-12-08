import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dinhan Store - Cửa hàng cầu lông chính hãng",
    template: "%s | Dinhan Store",
  },
  description:
    "Dinhan Store - Chuyên cung cấp vợt cầu lông, giày cầu lông, phụ kiện cầu lông chính hãng. Giá tốt nhất, giao hàng toàn quốc.",
  keywords: [
    "cầu lông",
    "vợt cầu lông",
    "giày cầu lông",
    "phụ kiện cầu lông",
    "dinhan store",
    "cửa hàng cầu lông",
    "badminton",
  ],
  authors: [{ name: "Dinhan Store" }],
  icons: {
    icon: "/store.png",
    apple: "/store.png",
  },
  openGraph: {
    title: "Dinhan Store - Cửa hàng cầu lông chính hãng",
    description:
      "Chuyên cung cấp vợt cầu lông, giày cầu lông, phụ kiện cầu lông chính hãng. Giá tốt nhất, giao hàng toàn quốc.",
    type: "website",
    locale: "vi_VN",
    siteName: "Dinhan Store",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ClerkProvider>

    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
        </ClerkProvider>

  );
}
