'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Icons } from '@/components/icons'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { loginAction } from '@/lib/actions/auth'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { UserRole } from '@prisma/client'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const t = useTranslations('auth.login')

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)

        try {
            const result = await loginAction(data)

            if (!result.success) {
                toast.error(result.error)
                return
            }

            // Success - redirect based on role
            toast.success(t('welcomeBack'))

            if (result.role === UserRole.FARMER) {
                // Check if farmer has completed their profile
                if (result.hasProfile) {
                    router.push('/farmer/dashboard')
                } else {
                    router.push('/farmer/profile/setup')
                }
            } else if (result.role === UserRole.CUSTOMER) {
                router.push('/customer/dashboard')
            } else {
                router.push('/products')
            }

            router.refresh()
        } catch (error) {
            console.error('Login error:', error)
            toast.error(t('error'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setIsLoading(true)
        try {
            await signIn(provider)
        } catch {
            toast.error(t('socialError'))
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
                    <CardDescription>{t('subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('email')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('emailPlaceholder')}
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('password')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={t('passwordPlaceholder')}
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? t('signingIn') : t('signIn')}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                {t('orContinue')}
              </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                        >
                            <Icons.google className="mr-2 h-4 w-4" />
                            {t('google')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isLoading}
                        >
                            <Icons.facebook className="mr-2 h-4 w-4" />
                            {t('facebook')}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="w-full text-center text-sm text-slate-600">
                        {t('noAccount')}{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-slate-900 hover:underline"
                        >
                            {t('signUp')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}