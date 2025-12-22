"use client"

import Link from "next/link"
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useAdmin } from "./context/AdminContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Chờ xác nhận", variant: "outline" },
  processing: { label: "Đang xử lý", variant: "secondary" },
  shipped: { label: "Đang giao", variant: "default" },
  delivered: { label: "Đã giao", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
}

export default function AdminDashboard() {
  const { orders, ordersLoading, stats, products, productsLoading } = useAdmin()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toLocaleString()
  }

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue) + "đ",
      description: "+20.1% so với tháng trước",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toString(),
      description: "+180.1% so với tháng trước",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts.toString(),
      description: "+19% so với tháng trước",
      icon: Package,
      trend: "up",
    },
    {
      title: "Đơn chờ xử lý",
      value: stats.pendingOrders.toString(),
      description: "Cần xử lý ngay",
      icon: TrendingUp,
      trend: stats.pendingOrders > 0 ? "down" : "up",
    },
  ]

  const recentOrders = orders.slice(0, 5)

  if (ordersLoading || productsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="mt-1 h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild size="sm">
          <Link href="/admin/analytics">Xem báo cáo</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{stat.title}</span>
              </div>
              <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 flex-shrink-0" />
                )}
                <span className="truncate">{stat.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
            <CardDescription className="text-xs">
              {stats.pendingOrders} đơn cần xử lý
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có đơn hàng nào
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Mã đơn</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Khách hàng</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Tổng tiền</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Trạng thái</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                        <td className="py-3 text-sm text-muted-foreground">{order.customerName}</td>
                        <td className="py-3 text-sm">{Number(order.total).toLocaleString()}đ</td>
                        <td className="py-3">
                          <Badge variant={statusLabels[order.status]?.variant || "outline"}>
                            {statusLabels[order.status]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{order.orderNumber}</span>
                      <Badge variant={statusLabels[order.status]?.variant || "outline"} className="text-xs">
                        {statusLabels[order.status]?.label || order.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{order.customerName}</div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{Number(order.total).toLocaleString()}đ</span>
                      <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
