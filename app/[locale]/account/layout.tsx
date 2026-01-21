"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, Settings, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const menuItems = [
  { href: "/", label: "Tài khoản", icon: User },
  { href: "/orders", label: "Đơn hàng", icon: Package },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  // Extract locale from pathname
  const locale = pathname.split("/")[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-76 flex-shrink-0 py-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === `/${locale}${item.href}` ||
                  (item.href !== "/account" && pathname.startsWith(`/${locale}${item.href}`));
                return (
                  <p
                    key={item.href}
                    onClick={() => router.push(`/${locale}/${item.href}`)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </p>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-12">{children}</main>
      </div>
    </div>
  );
}
