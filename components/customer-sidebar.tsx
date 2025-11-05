"use client"

import * as React from "react"
import {
  IconShoppingCart,
  IconDashboard,
  IconUser,
  IconReceipt,
  IconSettings,
  IconLogout,
  IconPlant,
  IconShoppingBag,
  IconMap,
} from "@tabler/icons-react"
import { signOut } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
      onClick: () => signOut({ callbackUrl: `/${locale}/login` }),
    },
  ]

  const userData = {
    name: user?.name || "Customer",
    email: user?.email || "",
    avatar: user?.image || "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={`/${locale}`}>
                <IconPlant className="!size-5 text-green-600" />
                <span className="text-base font-semibold">LocalRoots</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
