"use client"

import * as React from "react"
import {
  IconShoppingBag,
  IconDashboard,
  IconUser,
  IconReceipt,
  IconSettings,
  IconLogout,
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

interface FarmerSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function FarmerSidebar({ user, ...props }: FarmerSidebarProps) {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Navigation.farmer')

  const navMain = [
    {
      title: t('dashboard'),
      url: `/${locale}/farmer/dashboard`,
      icon: IconDashboard,
    },
    {
      title: t('myProducts'),
      url: `/${locale}/farmer/products`,
      icon: IconShoppingBag,
    },
    {
      title: t('orders'),
      url: `/${locale}/farmer/orders`,
      icon: IconReceipt,
    },
    {
      title: t('profile'),
      url: `/${locale}/farmer/profile`,
      icon: IconUser,
    },
  ]

  const navSecondary = [
    {
      title: t('settings'),
      url: `/${locale}/farmer/settings`,
      icon: IconSettings,
    },
    {
      title: t('logout'),
      url: "#",
      icon: IconLogout,
      onClick: () => signOut({ callbackUrl: `/${locale}/login` }),
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
