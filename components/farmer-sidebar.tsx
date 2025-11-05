"use client"

import * as React from "react"
import {
  IconShoppingBag,
  IconDashboard,
  IconUser,
  IconReceipt,
  IconSettings,
  IconLogout,
  IconPlant,
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

  const userData = {
    name: user?.name || "Farmer",
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
