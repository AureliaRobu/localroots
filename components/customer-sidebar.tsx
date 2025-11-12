"use client"

import * as React from "react"
import {
  IconShoppingCart,
  IconDashboard,
  IconUser,
  IconReceipt,
  IconSettings,
  IconLogout,
  IconShoppingBag,
  IconMap,
} from "@tabler/icons-react"
import { signOut } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

interface CustomerSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function CustomerSidebar({ user, ...props }: CustomerSidebarProps) {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Navigation.customer')

  const navMain = [
    {
      title: t('dashboard'),
      url: `/${locale}/customer/dashboard`,
      icon: IconDashboard,
    },
    {
      title: t('browseProducts'),
      url: `/${locale}/products`,
      icon: IconShoppingBag,
    },
    {
      title: t('myOrders'),
      url: `/${locale}/customer/orders`,
      icon: IconReceipt,
    },
    {
      title: t('shoppingCart'),
      url: `/${locale}/cart`,
      icon: IconShoppingCart,
    },
    {
      title: t('findFarmers'),
      url: `/${locale}/map`,
      icon: IconMap,
    },
  ]

  const navSecondary = [
    {
      title: t('settings'),
      url: `/${locale}/customer/settings`,
      icon: IconSettings,
    },
    {
      title: t('logout'),
      url: "#",
      icon: IconLogout,
      onClick: () => signOut(),
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent className="pt-4">
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
