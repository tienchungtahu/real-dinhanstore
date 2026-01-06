"use client"

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Database,
  Users,
  Command,
  Percent,
  BookOpen,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavGroup } from "./nav-group"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"

const sidebarData = {
  user: {
    name: "Admin",
    email: "admin@dinhanstore.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Dinh An Store",
      logo: Command,
      plan: "Admin Panel",
    },
  ],
  navGroups: [
    {
      title: "Tổng quan",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Sản phẩm",
          url: "/admin/products",
          icon: Package,
        },
        {
          title: "Đơn hàng",
          url: "/admin/orders",
          icon: ShoppingCart,
        },
        {
          title: "Giảm giá",
          url: "/admin/discounts",
          icon: Percent,
        },
        {
          title: "Thống kê",
          url: "/admin/analytics",
          icon: BarChart3,
        },
        {
          title: "Bài viết",
          url: "/admin/posts",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        {
          title: "Database",
          url: "/admin/database",
          icon: Database,
        },
        {
          title: "Người dùng",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "Cài đặt",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
