'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
    href: string
    children: React.ReactNode
    className?: string
    activeClassName?: string
    inactiveClassName?: string
    exact?: boolean
    onClick?: () => void
}

export function NavLink({
    href,
    children,
    className,
    activeClassName = 'text-green-600',
    inactiveClassName = 'text-slate-700',
    exact = false,
    onClick
}: NavLinkProps) {
    const pathname = usePathname()

    const isActive = exact
        ? pathname === href
        : pathname.startsWith(href)

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'text-sm font-medium transition-colors hover:text-green-600',
                isActive ? activeClassName : inactiveClassName,
                className
            )}
        >
            {children}
        </Link>
    )
}
