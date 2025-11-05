
import { requireFarmer } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { FarmerProfileEditForm } from '@/components/farmer/farmer-profile-edit-form'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

async function getFarmerProfile(userId: string) {
  return await prisma.farmerProfile.findUnique({
    where: { userId }
  })
}

export default async function EditProfilePage() {
  const user = await requireFarmer()
  const profile = await getFarmerProfile(user.id)
  const t = await getTranslations('farmer.profile')

  // If no profile exists, redirect to dashboard to create one
  if (!profile) {
    redirect('/farmer/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('editProfile')}</h1>
        <p className="mt-2 text-slate-600">
          {t('editDescription')}
        </p>
      </div>
      <FarmerProfileEditForm profile={profile} />
    </div>
  )
}
