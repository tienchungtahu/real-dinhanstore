"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Package, Eye } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders();
    }
  }, [isLoaded, user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Đơn hàng #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${statusLabels[order.status]?.color || "bg-gray-100"
                        }`}
                    >
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                    <Link
                      href={`/${locale}/account/orders/${order.id}`}
                      className="p-2 text-gray-400 hover:text-emerald-600"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.productName} x{item.quantity}
                        </span>
                        <span className="text-gray-900">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="font-bold text-emerald-600">
                      {Number(order.total).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
