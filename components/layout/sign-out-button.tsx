'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false })
            toast.success('Signed out successfully')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }

    return (
        <button
            onClick={handleSignOut}
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
        >
            Sign Out
        </button>
    )
}