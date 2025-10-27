'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function SignOutButton() {
    const router = useRouter()
    const t = useTranslations('header')

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false })
            toast.success('Signed out successfully')
            router.push('/')
            router.refresh()
        } catch {
            toast.error('Failed to sign out')
        }
    }

    return (
        <button
            onClick={handleSignOut}
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
        >
            {t('signOut')}
        </button>
    )
}