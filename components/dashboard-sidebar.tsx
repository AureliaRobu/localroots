"use client"

import * as React from "react"
import {
  IconShoppingBag,
  IconDashboard,
  IconUser,
  IconReceipt,
  IconSettings,
  IconLogout,
  IconShoppingCart,
  IconMap,
  IconMessage,
} from "@tabler/icons-react"
import { signOut } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useParams } from "next/navigation"

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  hasSellerProfile?: boolean
}

export function DashboardSidebar({ user, hasSellerProfile, ...props }: DashboardSidebarProps) {
  const params = useParams()
  const locale = params.locale as string

  const buyingNav = [
    {
      title: "Dashboard",
      url: `/${locale}/dashboard/buying`,
      icon: IconDashboard,
    },
    {
      title: "My Orders",
      url: `/${locale}/dashboard/buying/orders`,
      icon: IconReceipt,
    },
    {
      title: "Shopping Cart",
      url: `/${locale}/cart`,
      icon: IconShoppingCart,
    },
    {
      title: "Find Farmers",
      url: `/${locale}/map`,
      icon: IconMap,
    },
  ]

  const sellingNav = [
    {
      title: "Dashboard",
      url: `/${locale}/dashboard/selling`,
      icon: IconDashboard,
    },
    {
      title: "My Products",
      url: `/${locale}/dashboard/selling/products`,
      icon: IconShoppingBag,
    },
    {
      title: "Orders",
      url: `/${locale}/dashboard/selling/orders`,
      icon: IconReceipt,
    },
    {
      title: "Profile",
      url: `/${locale}/dashboard/selling/profile/edit`,
      icon: IconUser,
    },
  ]

  const navSecondary = [
    {
      title: "Messages",
      url: `/${locale}/messages`,
      icon: IconMessage,
    },
    {
      title: "Settings",
      url: `/${locale}/settings`,
      icon: IconSettings,
    },
    {
      title: "Logout",
      url: "#",
      icon: IconLogout,
      onClick: () => signOut({ callbackUrl: `/${locale}/login` }),
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Buying</SidebarGroupLabel>
          <NavMain items={buyingNav} />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Selling</SidebarGroupLabel>
          {hasSellerProfile ? (
            <NavMain items={sellingNav} />
          ) : (
            <NavMain items={[
              {
                title: "Start Selling",
                url: `/${locale}/dashboard/selling/profile/setup`,
                icon: IconShoppingBag,
              },
            ]} />
          )}
        </SidebarGroup>

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
