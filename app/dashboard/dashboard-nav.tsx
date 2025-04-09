"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Store, Package, ShoppingCart, CreditCard, Settings, User } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      exact: true,
    },
    {
      href: "/dashboard/stores",
      label: "Stores",
      icon: <Store className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/orders",
      label: "Orders",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route) => {
        const isActive = route.exact ? pathname === route.href : pathname.startsWith(route.href)

        return (
          <Link key={route.href} href={route.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", {
                "bg-muted hover:bg-muted": isActive,
              })}
            >
              {route.icon}
              {route.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

