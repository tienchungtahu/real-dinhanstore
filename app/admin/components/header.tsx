"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }
    document.addEventListener("scroll", onScroll, { passive: true })
    return () => document.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "z-50 h-16 bg-background",
        fixed && "sticky top-0 w-full",
        offset > 10 && fixed ? "shadow-sm" : "shadow-none",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-full items-center gap-3 px-4 sm:gap-4",
          offset > 10 && fixed && "backdrop-blur-lg"
        )}
      >
        <SidebarTrigger variant="outline" className="scale-125 md:scale-100" />
        <Separator orientation="vertical" className="h-6" />
        {children}
      </div>
    </header>
  )
}
