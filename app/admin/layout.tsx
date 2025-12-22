"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Loader2, ShieldX } from "lucide-react"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AdminProvider } from "./context/AdminContext"
import { AppSidebar } from "./components/app-sidebar"
import { Header } from "./components/header"
import { Search } from "./components/search"
import { ThemeSwitch } from "./components/theme-switch"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAdminRole() {
      if (!isLoaded) return

      if (!isSignedIn) {
        setIsAdmin(false)
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch("/api/auth/check-admin")
        const data = await response.json()
        setIsAdmin(data.isAdmin === true)
      } catch (error) {
        console.error("Error checking admin role:", error)
        setIsAdmin(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminRole()
  }, [isLoaded, isSignedIn])

  // Loading state
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Not admin - show 403 error
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền truy cập trang quản trị. Vui lòng liên hệ admin để được cấp quyền.
          </p>
          <Button onClick={() => router.push("/")}>
            Về trang chủ
          </Button>
        </div>
      </div>
    )
  }

  // Admin - render with sidebar
  return (
    <AdminProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <AdminContent>
          <Header fixed>
            <Search />
            <div className="ml-auto flex items-center space-x-4">
              <ThemeSwitch />
            </div>
          </Header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </AdminContent>
      </SidebarProvider>
    </AdminProvider>
  )
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar()
  
  return (
    <main 
      className="flex-1 flex flex-col min-h-svh bg-background transition-[margin-left] duration-200 ease-linear"
      style={{
        marginLeft: isMobile ? 0 : state === "expanded" ? "16rem" : "5rem"
      }}
    >
      {children}
    </main>
  )
}
