"use client"

import { useState, useMemo } from "react"
import { Eye, Search, Filter, Trash2, X } from "lucide-react"
import { useAdmin, Order } from "../context/AdminContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const statusOptions = [
  { value: "pending", label: "Chờ xác nhận", variant: "outline" as const },
  { value: "processing", label: "Đang xử lý", variant: "secondary" as const },
  { value: "shipped", label: "Đang giao", variant: "default" as const },
  { value: "delivered", label: "Đã giao", variant: "default" as const },
  { value: "cancelled", label: "Đã hủy", variant: "destructive" as const },
]

export default function OrdersPage() {
  const { orders, ordersLoading, updateOrderStatus, updateOrderNote, deleteOrder } = useAdmin()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search)
      const matchStatus = filterStatus === "all" || o.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [orders, search, filterStatus])

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return
    const success = await deleteOrder(orderId)
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder(null)
    }
  }

  const getStatusVariant = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.variant || "outline"
  }

  const getStatusLabel = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.label || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 border border-input rounded-md bg-background text-sm flex-1"
              >
                <option value="all">Tất cả trạng thái</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
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
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Ngày đặt</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Chưa có đơn hàng nào
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                          <td className="py-3">
                            <div>
                              <p className="text-sm font-medium">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            </div>
                          </td>
                          <td className="py-3 text-sm font-medium">{Number(order.total).toLocaleString()}đ</td>
                          <td className="py-3">
                            <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {order.status === "pending" && (
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Chưa có đơn hàng nào</p>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                        <Badge variant={getStatusVariant(order.status)} className="text-xs">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-xs">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-muted-foreground">{order.customerPhone}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-medium">{Number(order.total).toLocaleString()}đ</span>
                          <span className="text-muted-foreground ml-2">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === "pending" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNote={updateOrderNote}
        />
      )}
    </div>
  )
}


function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onUpdateNote,
}: {
  order: Order
  onClose: () => void
  onUpdateStatus: (id: number, status: string) => void
  onUpdateNote: (id: number, note: string) => Promise<boolean>
}) {
  const [note, setNote] = useState(order.note || "")
  const [saving, setSaving] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const saveNote = async () => {
    setSaving(true)
    await onUpdateNote(order.id, note)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Đơn hàng #{order.orderNumber}</CardTitle>
            <CardDescription>{formatDate(order.createdAt)}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Trạng thái:</span>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              className="h-8 px-3 border border-input rounded-md bg-background text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Họ tên:</span>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Điện thoại:</span>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Địa chỉ giao hàng:</span>
                <p className="font-medium">{order.shippingAddress}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Thanh toán:</span>
                <p className="font-medium">{order.paymentMethod || "COD"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Sản phẩm</h3>
            <div className="border rounded-lg divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(item.price).toLocaleString()}đ x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{Number(item.total).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{Number(order.subtotal).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển:</span>
                <span>{Number(order.shippingFee).toLocaleString()}đ</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Giảm giá:</span>
                  <span>-{Number(order.discount).toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-primary">{Number(order.total).toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Ghi chú</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
              placeholder="Thêm ghi chú cho đơn hàng..."
            />
            <Button variant="secondary" size="sm" className="mt-2" onClick={saveNote} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu ghi chú"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
