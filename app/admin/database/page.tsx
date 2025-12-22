"use client"

import { useState } from "react"
import { Database, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DatabasePage() {
  const [status, setStatus] = useState<{ status: string; message: string; database?: string; host?: string } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const checkStatus = async () => {
    setLoading("status")
    try {
      const res = await fetch("/api/db/status")
      const data = await res.json()
      setStatus(data)
      setMessage({ type: data.status === "connected" ? "success" : "error", text: data.message })
    } catch {
      setMessage({ type: "error", text: "Không thể kết nối" })
    } finally {
      setLoading(null)
    }
  }

  const initDatabase = async () => {
    setLoading("init")
    setMessage(null)
    try {
      const res = await fetch("/api/db/init", { method: "POST" })
      const data = await res.json()
      setMessage({ type: res.ok ? "success" : "error", text: data.message || data.error })
    } catch {
      setMessage({ type: "error", text: "Lỗi khi tạo database" })
    } finally {
      setLoading(null)
    }
  }

  const seedDatabase = async () => {
    setLoading("seed")
    setMessage(null)
    try {
      const res = await fetch("/api/db/seed", { method: "POST" })
      const data = await res.json()
      setMessage({
        type: res.ok ? "success" : "error",
        text: data.message || data.error || `Đã tạo ${data.categories} danh mục và ${data.products} sản phẩm`,
      })
    } catch {
      setMessage({ type: "error", text: "Lỗi khi seed data" })
    } finally {
      setLoading(null)
    }
  }

  const addPlaceholderImages = async () => {
    setLoading("images")
    setMessage(null)
    try {
      const res = await fetch("/api/products/add-placeholder-images", { method: "POST" })
      const data = await res.json()
      setMessage({ type: res.ok ? "success" : "error", text: data.message || data.error })
    } catch {
      setMessage({ type: "error", text: "Lỗi khi thêm ảnh" })
    } finally {
      setLoading(null)
    }
  }

  const resetDatabase = async () => {
    if (!confirm("Bạn có chắc muốn xóa tất cả sản phẩm và danh mục? Hành động này không thể hoàn tác!")) return
    setLoading("reset")
    setMessage(null)
    try {
      const res = await fetch("/api/db/reset", { method: "POST" })
      const data = await res.json()
      setMessage({ type: res.ok ? "success" : "error", text: data.message || data.error })
    } catch {
      setMessage({ type: "error", text: "Lỗi khi reset database" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quản lý Database</h1>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle className="text-base">Trạng thái kết nối</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={loading === "status"}>
            {loading === "status" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Kiểm tra
          </Button>
        </CardHeader>
        {status && (
          <CardContent>
            <div className={`p-4 rounded-lg ${status.status === "connected" ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
              <div className="flex items-center gap-2">
                {status.status === "connected" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm ${status.status === "connected" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                  {status.message}
                </span>
              </div>
              {status.database && (
                <p className="text-xs text-muted-foreground mt-2">
                  Database: {status.database} @ {status.host}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">1. Tạo Database</CardTitle>
            <CardDescription className="text-xs">Tạo database MySQL</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button className="w-full" size="sm" onClick={initDatabase} disabled={loading === "init"}>
              {loading === "init" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Tạo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">2. Seed Data</CardTitle>
            <CardDescription className="text-xs">Thêm data mẫu</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button className="w-full" size="sm" variant="secondary" onClick={seedDatabase} disabled={loading === "seed"}>
              {loading === "seed" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Seed
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">3. Thêm ảnh</CardTitle>
            <CardDescription className="text-xs">Ảnh placeholder</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button className="w-full" size="sm" variant="outline" onClick={addPlaceholderImages} disabled={loading === "images"}>
              {loading === "images" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Thêm
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-destructive">⚠️ Reset</CardTitle>
            <CardDescription className="text-xs">Xóa tất cả data</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button className="w-full" size="sm" variant="destructive" onClick={resetDatabase} disabled={loading === "reset"}>
              {loading === "reset" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
