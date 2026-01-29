import {Link} from '@/i18n/navigation';
import {auth} from '@/lib/auth/auth'
import {Button} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {SignOutButton} from '@/components/layout/sign-out-button'
import {MobileMenu} from '@/components/layout/mobile-menu'
import {LanguageSwitcher} from '@/components/layout/language-switcher'
import {CartButton} from '@/components/cart/cart-button'
import {ChatButton} from '@/components/layout/ChatButton'
import {getTranslations} from 'next-intl/server'

export async function Header() {
    const session = await auth()
    const user = session?.user
    const t = await getTranslations('header')

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Mobile Menu */}
                <MobileMenu user={user}/>

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
                        LR
                    </div>
                    <span className="hidden font-bold sm:inline-block">
            LocalRoots
          </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                        {t('products')}
                    </Link>
                    <Link
                        href="/map"
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                        {t('map')}
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                        {t('about')}
                    </Link>

                    {/* Language Switcher */}
                    <LanguageSwitcher/>

                    {/* Cart Button - Available for all authenticated users */}
                    {user && <CartButton/>}

                    {/* Chat Button - Available for authenticated users */}
                    {user && <ChatButton/>}

                    {/* Auth Section */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.image || undefined} alt={user.name || 'User'}/>
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
                                <DropdownMenuSeparator/>

                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/buying" className="cursor-pointer">
                                        {t('buyingDashboard') || 'Buying'}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/selling" className="cursor-pointer">
                                        {t('sellingDashboard') || 'Selling'}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>

                                <DropdownMenuItem asChild>
                                    <SignOutButton/>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    {t('signIn')}
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    {t('getStarted')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}