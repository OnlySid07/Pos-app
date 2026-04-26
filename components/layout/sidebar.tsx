'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Home, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const links: SidebarLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: <Users className="h-4 w-4" />,
    roles: ['admin', 'asesor'],
  },
  {
    label: 'Propiedades',
    href: '/propiedades',
    icon: <Home className="h-4 w-4" />,
    roles: ['admin', 'asesor'],
  },
  {
    label: 'Ventas',
    href: '/ventas',
    icon: <FileText className="h-4 w-4" />,
    roles: ['admin', 'asesor', 'gerencia'],
  },
  {
    label: 'Caja y Pagos',
    href: '/caja-pagos',
    icon: <DollarSign className="h-4 w-4" />,
    roles: ['admin', 'finanzas', 'gerencia'],
  },
  {
    label: 'Reportes',
    href: '/reportes',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ['admin', 'gerencia', 'finanzas'],
  },
  {
    label: 'Configuración',
    href: '/configuracion',
    icon: <Settings className="h-4 w-4" />,
    roles: ['admin'],
  },
]

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredLinks = links.filter(link => {
    if (!link.roles) return true
    return link.roles.includes(userRole || '')
  })

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-background border rounded-md p-2"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-2xl font-bold text-sidebar-foreground">JOS</h1>
            <p className="text-xs text-sidebar-foreground/60 mt-1">Gestión Inmobiliaria</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
