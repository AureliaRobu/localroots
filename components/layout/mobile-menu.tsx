'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SignOutButton } from '@/components/layout/sign-out-button'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { NavLink } from '@/components/layout/nav-link'
import { useTranslations } from 'next-intl'

interface MobileMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('header')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
                LR
              </div>
              <span className="font-bold">LocalRoots</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-8">
          {/* User Info Section */}
          {user && (
            <div className="flex items-center gap-3 pb-4 border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="bg-green-600 text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-slate-500 mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <NavLink
              href="/products"
              className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-slate-100"
              activeClassName="text-green-600 bg-green-50"
              onClick={() => setOpen(false)}
            >
              {t('products')}
            </NavLink>
            <NavLink
              href="/map"
              className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-slate-100"
              activeClassName="text-green-600 bg-green-50"
              onClick={() => setOpen(false)}
            >
              {t('map')}
            </NavLink>
            <NavLink
              href="/about"
              className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-slate-100"
              activeClassName="text-green-600 bg-green-50"
              onClick={() => setOpen(false)}
            >
              {t('about')}
            </NavLink>

            {/* Language Switcher */}
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
          </nav>

          {/* User-specific Links */}
          {user && (
            <div className="flex flex-col gap-2 pt-4 border-t">
              <NavLink
                href="/dashboard/buying"
                className="flex items-center rounded-lg px-3 py-2 transition-all hover:bg-slate-100"
                activeClassName="text-green-600 bg-green-50"
                onClick={() => setOpen(false)}
              >
                {t('dashboard') || 'Dashboard'}
              </NavLink>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
            {user ? (
              <SignOutButton />
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    {t('getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
