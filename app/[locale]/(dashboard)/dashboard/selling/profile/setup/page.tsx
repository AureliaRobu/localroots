import { requireAuth, getSellerProfile } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { FarmerProfileForm } from '@/components/farmer/farmer-profile-form'
import { getTranslations } from 'next-intl/server'

export default async function SellerProfileSetupPage() {
    const user = await requireAuth()
    const profile = await getSellerProfile(user.id)
    const t = await getTranslations('farmer.dashboard')

    // If already has profile, redirect to dashboard
    if (profile) {
        redirect('/dashboard/selling')
    }

    return (
        <div className="mx-auto max-w-3xl px-4 lg:px-6 py-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">{t('welcome', { name: user.name ?? 'there' })}</h1>
                <p className="mt-2 text-slate-600">
                    {t('setupProfile')}
                </p>
            </div>
            <FarmerProfileForm />
        </div>
    )
}
