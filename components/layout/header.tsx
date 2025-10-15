import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SignOutButton } from '@/components/layout/sign-out-button'
import { UserRole } from '@prisma/client'

export async function Header() {
    const session = await auth()
    const user = session?.user

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
                        LR
                    </div>
                    <span className="hidden font-bold sm:inline-block">
            LocalRoots
          </span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                        Products
                    </Link>
                    <Link
                        href="/map"
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                        Map
                    </Link>

                    {/* Auth Section */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                                        <AvatarFallback className="bg-green-600 text-white">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-slate-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {user.role === UserRole.FARMER && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/farmer/dashboard" className="cursor-pointer">
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/farmer/products" className="cursor-pointer">
                                                My Products
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {user.role === UserRole.CUSTOMER && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/customer/dashboard" className="cursor-pointer">
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                <DropdownMenuItem asChild>
                                    <SignOutButton />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}