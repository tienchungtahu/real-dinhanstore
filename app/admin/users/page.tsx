"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, UserX, Calendar, Mail, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  clerkId: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt: string
  _count?: {
    orders: number
  }
}

interface UserStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  newUsersThisMonth: number
  usersWithOrders: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        
        // Calculate stats
        const totalUsers = data.users?.length || 0
        const adminUsers = data.users?.filter((u: User) => u.role === "admin").length || 0
        const regularUsers = totalUsers - adminUsers
        
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const newUsersThisMonth = data.users?.filter((u: User) => 
          new Date(u.createdAt) >= firstDayOfMonth
        ).length || 0
        
        const usersWithOrders = data.users?.filter((u: User) => 
          (u._count?.orders || 0) > 0
        ).length || 0

        setStats({
          totalUsers,
          adminUsers,
          regularUsers,
          newUsersThisMonth,
          usersWithOrders,
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Thống kê người dùng</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Tổng người dùng</p>
            </div>
            <p className="text-xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground">Đã mua hàng</p>
            </div>
            <p className="text-xl font-bold">{stats?.usersWithOrders || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground">Mới tháng này</p>
            </div>
            <p className="text-xl font-bold">{stats?.newUsersThisMonth || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <UserX className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">Quản trị viên</p>
            </div>
            <p className="text-xl font-bold">{stats?.adminUsers || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Tất cả người dùng đã đăng ký trên hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có người dùng nào
            </p>
          ) : (
            <>
              {/* Desktop table - hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Người dùng</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Vai trò</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Đơn hàng</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name || "Chưa cập nhật"}</p>
                              <p className="text-xs text-muted-foreground">{user.phone || "Chưa có SĐT"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Admin" : "Khách hàng"}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm">
                          {user._count?.orders || 0} đơn
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name || "Chưa cập nhật"}</p>
                          <p className="text-xs text-muted-foreground">{user.phone || "Chưa có SĐT"}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {user.role === "admin" ? "Admin" : "Khách hàng"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      <Mail className="w-3 h-3 inline mr-1" />
                      {user.email}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{user._count?.orders || 0} đơn hàng</span>
                      <span>{formatDate(user.createdAt)}</span>
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
