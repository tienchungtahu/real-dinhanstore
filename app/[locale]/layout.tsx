import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NavigationMenuDemo } from "@/app/components/navigation-menu/navigation-menu";
import { UserSync } from "@/app/components/auth/UserSync";
import { ProductStoreProvider } from "@/app/hooks/useProductStore";
import { CartProvider } from "@/app/hooks/useCartStore";
import { CartModal } from "@/app/components/cart/CartModal";
import { ChatBot } from "@/app/components/chat/ChatBot";

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
  icons: {
    icon: "/store.png",
    apple: "/store.png",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ProductStoreProvider>
        <CartProvider>
          <UserSync />
          <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 via-slate-50 to-pink-50 overflow-auto">
            <div className="flex items-center justify-center py-2 border-b">
              <NavigationMenuDemo />
            </div>
            <main className="w-full pt-20 px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
          <CartModal />
          <ChatBot />
        </CartProvider>
      </ProductStoreProvider>
    </NextIntlClientProvider>
  );
}