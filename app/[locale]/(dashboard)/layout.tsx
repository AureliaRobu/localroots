import { SocketProvider } from '@/components/providers/SocketProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocketProvider>{children}</SocketProvider>
}
