import { getCurrentUser } from '@/lib/auth/session'
import { MessageFarmerButton } from './MessageFarmerButton'

interface MessageFarmerWrapperProps {
    farmerId: string
    farmerName: string | null
}

// Async wrapper that checks user authentication
// Loaded via Suspense to allow page caching
export async function MessageFarmerWrapper({
    farmerId,
    farmerName,
}: MessageFarmerWrapperProps) {
    const currentUser = await getCurrentUser()

    // Don't show message button if not logged in or if viewing own profile
    if (!currentUser || currentUser.id === farmerId) {
        return null
    }

    return (
        <div className="mt-4">
            <MessageFarmerButton
                farmerId={farmerId}
                farmerName={farmerName}
            />
        </div>
    )
}

export function MessageFarmerSkeleton() {
    return (
        <div className="mt-4">
            <div className="h-9 w-32 bg-slate-200 animate-pulse rounded-md" />
        </div>
    )
}
