import { Sidebar } from '@/components/layout/sidebar'
import { getUserAndRole } from '@/lib/auth-service'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = await getUserAndRole()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={role} />
      <main className="flex-1 overflow-auto lg:ml-64">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
