"use client";

import { useEffect, useState, use } from "react";
import { Package, ArrowLeft, MapPin, CreditCard, Calendar, ShoppingBag, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
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
    customerName?: string;
    customerEmail?: string;
    note?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50", icon: Clock },
    processing: { label: "Đang xử lý", color: "bg-blue-500/20 text-blue-300 border-blue-500/50", icon: Package },
    shipped: { label: "Đang giao", color: "bg-purple-500/20 text-purple-300 border-purple-500/50", icon: Truck },
    delivered: { label: "Đã giao", color: "bg-green-500/20 text-green-300 border-green-500/50", icon: CheckCircle2 },
    cancelled: { label: "Đã hủy", color: "bg-red-500/20 text-red-300 border-red-500/50", icon: XCircle },
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const locale = useLocale();

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (!res.ok) throw new Error("Order not found");
            const data = await res.json();
            setOrder(data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse"></div>
                    <div className="h-64 bg-white/10 rounded-2xl animate-pulse"></div>
                    <div className="h-40 bg-white/10 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center max-w-md w-full shadow-2xl">
                    <Package className="w-20 h-20 text-white/50 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-3">Không tìm thấy đơn hàng</h2>
                    <p className="text-white/70 mb-8">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <Link
                        href={`/${locale}/account/orders`}
                        className="inline-flex items-center px-6 py-3 bg-white text-purple-900 font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-purple-900/20"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const StatusIcon = statusConfig[order.status]?.icon || Package;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 md:p-8 text-white font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}/account/orders`}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                Đơn hàng #{order.orderNumber}
                            </h1>
                            <p className="text-white/60 text-sm mt-1">
                                Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-md ${statusConfig[order.status]?.color || "bg-gray-500/20 text-gray-300 border-gray-500/50"
                        }`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold tracking-wide uppercase text-sm">
                            {statusConfig[order.status]?.label || order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <h2 className="font-bold text-xl flex items-center gap-3">
                                    <ShoppingBag className="w-6 h-6 text-pink-300" />
                                    Sản phẩm đã mua
                                </h2>
                            </div>
                            <div className="divide-y divide-white/10">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-white/5 transition-colors">
                                        <div className="w-24 h-24 bg-white/10 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/10 shadow-inner">
                                            <Package className="w-10 h-10 text-white/40" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-white mb-1 truncate">{item.productName}</h3>
                                            <p className="text-white/60 font-medium">Số lượng: {item.quantity}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-2xl text-white">
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </p>
                                            <p className="text-sm text-white/50">
                                                {item.price.toLocaleString()}đ / cái
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Total Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all">
                            <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-indigo-300" />
                                Thanh toán
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-white/70">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-white">{Number(order.total).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-white/70">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium text-white">Miễn phí</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <span className="font-bold text-lg">Tổng cộng</span>
                                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                                        {Number(order.total).toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                            <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-emerald-300" />
                                Thông tin nhận hàng
                            </h2>
                            <div className="space-y-6">
                                {order.customerName && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
                                            <span className="font-bold text-lg text-white">
                                                {order.customerName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{order.customerName}</p>
                                            {order.customerEmail && (
                                                <p className="text-white/60">{order.customerEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {order.note && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider text-xs">Ghi chú</p>
                                        <p className="text-white/90 italic">
                                            "{order.note}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-white/40 text-sm">Cần hỗ trợ? <a href="#" className="text-white underline hover:text-white/80">Liên hệ ngay</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
