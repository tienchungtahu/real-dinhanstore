"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react"
import { useAdmin } from "../context/AdminContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartDataItem {
  date: string
  revenue: number
  orders: number
}

interface RevenueData {
  chartData: ChartDataItem[]
  summary: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
  }
}

type PeriodType = "today" | "yesterday" | "3days" | "7days" | "custom" | "month"

function calculateNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 100000
  // Round up to nice number
  if (maxValue <= 1000) return 1000
  if (maxValue <= 5000) return 5000
  if (maxValue <= 10000) return 10000
  if (maxValue <= 50000) return 50000
  if (maxValue <= 100000) return 100000
  if (maxValue <= 200000) return 200000
  if (maxValue <= 300000) return 300000
  if (maxValue <= 500000) return 500000
  if (maxValue <= 1000000) return 1000000
  if (maxValue <= 2000000) return 2000000
  if (maxValue <= 5000000) return 5000000
  if (maxValue <= 10000000) return 10000000
  return Math.ceil(maxValue / 10000000) * 10000000
}

export default function AnalyticsPage() {
  const { orders, stats, ordersLoading } = useAdmin()
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("7days")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {}
    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        order.items?.forEach((item) => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { name: item.productName, sold: 0, revenue: 0 }
          }
          productSales[item.productName].sold += item.quantity
          productSales[item.productName].revenue += Number(item.total)
        })
      }
    })
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [orders])

  const fetchRevenueData = useCallback(async () => {
    setChartLoading(true)
    try {
      let url = `/api/analytics/revenue?period=${selectedPeriod}`
      if (selectedPeriod === "custom" && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`
      } else if (selectedPeriod === "month" && selectedMonth) {
        url += `&month=${selectedMonth}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const result = await res.json()
        setRevenueData(result)
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setChartLoading(false)
    }
  }, [selectedPeriod, customStartDate, customEndDate, selectedMonth])

  useEffect(() => {
    if (selectedPeriod === "custom" && (!customStartDate || !customEndDate)) return
    if (selectedPeriod === "month" && !selectedMonth) return
    fetchRevenueData()
  }, [selectedPeriod, customStartDate, customEndDate, selectedMonth, fetchRevenueData])

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
  }

  const statCards = [
    { label: "Doanh thu", value: formatPrice(stats.totalRevenue) + "đ", icon: DollarSign, change: `${stats.deliveredOrders} đơn`, up: true },
    { label: "Đơn hàng", value: stats.totalOrders.toString(), icon: ShoppingCart, change: `${stats.pendingOrders} chờ xử lý`, up: true },
    { label: "Sản phẩm", value: stats.totalProducts.toString(), icon: Package, change: "Đang bán", up: true },
    { label: "Đã giao", value: stats.deliveredOrders.toString(), icon: Users, change: `${stats.cancelledOrders} đã hủy`, up: stats.deliveredOrders > stats.cancelledOrders },
  ]

  if (ordersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Thống kê</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${stat.up ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="hidden sm:inline">{stat.change}</span>
                </span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Biểu đồ doanh thu
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "today", label: "Hôm nay" },
                { value: "yesterday", label: "Hôm qua" },
                { value: "7days", label: "7 ngày" },
              ].map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value as PeriodType)}
                >
                  {period.label}
                </Button>
              ))}
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("month")}
              >
                Tháng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedPeriod === "custom" && (
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Từ ngày:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm bg-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Đến ngày:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm bg-background"
                />
              </div>
            </div>
          )}

          {selectedPeriod === "month" && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
              <label className="text-sm font-medium">Chọn tháng:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm bg-background"
              />
            </div>
          )}

          {chartLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : revenueData && revenueData.chartData.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                <div className="text-center p-2 md:p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm md:text-2xl font-bold text-primary">{formatPrice(revenueData.summary.totalRevenue)}đ</p>
                  <p className="text-xs text-muted-foreground mt-1">Tổng doanh thu</p>
                </div>
                <div className="text-center p-2 md:p-4 bg-blue-500/5 rounded-xl">
                  <p className="text-sm md:text-2xl font-bold text-blue-600">{revenueData.summary.totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">Số đơn hàng</p>
                </div>
                <div className="text-center p-2 md:p-4 bg-purple-500/5 rounded-xl">
                  <p className="text-sm md:text-2xl font-bold text-purple-600">{formatPrice(revenueData.summary.avgOrderValue)}đ</p>
                  <p className="text-xs text-muted-foreground mt-1">TB/đơn</p>
                </div>
              </div>

              {(() => {
                const maxRevenue = Math.max(...revenueData.chartData.map(d => d.revenue), 0)
                const chartMaxValue = calculateNiceMax(maxRevenue)
                const yAxisLabels = [formatPrice(chartMaxValue), formatPrice(chartMaxValue * 0.75), formatPrice(chartMaxValue * 0.5), formatPrice(chartMaxValue * 0.25), "0"]
                const chartHeight = 256 // h-64 = 256px

                return (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-10 w-14 flex flex-col justify-between text-xs text-muted-foreground">
                      {yAxisLabels.map((label, i) => (<span key={i}>{label}</span>))}
                    </div>
                    <div className="ml-16 relative">
                      <div className="absolute inset-0 bottom-10 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (<div key={i} className="border-t border-border w-full" />))}
                      </div>
                      <div className="flex items-end gap-1" style={{ height: chartHeight }}>
                        {revenueData.chartData.map((item) => {
                          const barHeightPx = chartMaxValue > 0 
                            ? Math.max(Math.round((item.revenue / chartMaxValue) * chartHeight), item.revenue > 0 ? 10 : 4) 
                            : 4
                          return (
                            <div key={item.date} className="flex-1 group relative h-full flex items-end">
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 pointer-events-none z-20 whitespace-nowrap shadow-xl border">
                                <p className="font-semibold text-primary">{formatDate(item.date)}</p>
                                <p className="mt-1">💰 {item.revenue.toLocaleString()}đ</p>
                                <p>📦 {item.orders} đơn hàng</p>
                              </div>
                              <div
                                style={{ 
                                  height: barHeightPx,
                                  backgroundColor: item.revenue > 0 ? '#10b981' : '#e5e7eb'
                                }}
                                className="w-full rounded-t cursor-pointer transition-all hover:opacity-80"
                              />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-1 mt-2 h-8">
                        {revenueData.chartData.map((item) => (
                          <div key={item.date} className="flex-1 text-center">
                            <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="w-16 h-16 mb-4 opacity-30" />
              <p>Không có dữ liệu trong khoảng thời gian này</p>
            </div>
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "pending", label: "Chờ xác nhận", color: "bg-yellow-500" },
              { key: "processing", label: "Đang xử lý", color: "bg-blue-500" },
              { key: "shipped", label: "Đang giao", color: "bg-purple-500" },
              { key: "delivered", label: "Đã giao", color: "bg-green-500" },
              { key: "cancelled", label: "Đã hủy", color: "bg-red-500" },
            ].map((status) => {
              const count = stats.ordersByStatus[status.key] || 0
              const percent = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0
              return (
                <div key={status.key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{status.label}</span>
                    <span className="font-semibold">{count} <span className="text-muted-foreground font-normal">({percent.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${status.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có dữ liệu bán hàng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-200 text-gray-600" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sold} đã bán</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatPrice(product.revenue)}đ</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tổng quan doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <div className="text-center p-3 md:p-6 bg-primary/5 rounded-xl">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <p className="text-lg md:text-3xl font-bold text-primary">{formatPrice(stats.totalRevenue)}đ</p>
              <p className="text-xs text-muted-foreground mt-2">Tổng doanh thu</p>
            </div>
            <div className="text-center p-3 md:p-6 bg-blue-500/5 rounded-xl">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-lg md:text-3xl font-bold text-blue-600">{stats.deliveredOrders}</p>
              <p className="text-xs text-muted-foreground mt-2">Đơn hoàn thành</p>
            </div>
            <div className="text-center p-3 md:p-6 bg-purple-500/5 rounded-xl">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-lg md:text-3xl font-bold text-purple-600">
                {stats.deliveredOrders > 0 ? formatPrice(stats.totalRevenue / stats.deliveredOrders) + "đ" : "0đ"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">TB/đơn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
