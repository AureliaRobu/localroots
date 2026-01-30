'use client'

import { NavLink } from '@/components/layout/nav-link'

interface HeaderNavProps {
    translations: {
        products: string
        map: string
        about: string
    }
}

export function HeaderNav({ translations }: HeaderNavProps) {
    return (
        <>
            <NavLink href="/products">
                {translations.products}
            </NavLink>
            <NavLink href="/map">
                {translations.map}
            </NavLink>
            <NavLink href="/about">
                {translations.about}
            </NavLink>
        </>
    )
}
