"use client"

import { useState } from "react"
import { Save, Store, Bell, Shield, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    name: "Dinhan Store",
    email: "contact@dinhanstore.com",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  })

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    newsletter: false,
  })

  return (
    <div className="space-y-3">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Cài đặt</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Thông tin cửa hàng</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tên cửa hàng</label>
              <Input
                value={storeSettings.name}
                onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={storeSettings.email}
                onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                type="tel"
                value={storeSettings.phone}
                onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Thông báo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted">
            <div>
              <p className="font-medium">Đơn hàng mới</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi có đơn hàng mới</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newOrder}
              onChange={(e) => setNotifications({ ...notifications, newOrder: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted">
            <div>
              <p className="font-medium">Cảnh báo tồn kho</p>
              <p className="text-sm text-muted-foreground">Thông báo khi sản phẩm sắp hết hàng</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.lowStock}
              onChange={(e) => setNotifications({ ...notifications, lowStock: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted">
            <div>
              <p className="font-medium">Bản tin</p>
              <p className="text-sm text-muted-foreground">Nhận email về tính năng mới và cập nhật</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Thanh toán</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            <span>Chuyển khoản ngân hàng</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
            <input type="checkbox" className="w-5 h-5 rounded" />
            <span>Ví điện tử (MoMo, ZaloPay)</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Bảo mật</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mật khẩu hiện tại</label>
            <Input type="password" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <Input type="password" />
            </div>
            <div>
              <label className="text-sm font-medium">Xác nhận mật khẩu</label>
              <Input type="password" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}
