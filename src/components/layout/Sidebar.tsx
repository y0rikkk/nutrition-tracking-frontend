import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Weight, Target, Lightbulb, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'

const navItems = [
  { to: '/', icon: Home, label: 'Дашборд' },
  { to: '/weight', icon: Weight, label: 'Вес' },
  { to: '/goals', icon: Target, label: 'Цели' },
  { to: '/advice', icon: Lightbulb, label: 'Советы' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { logout, refreshToken, user } = useAuthStore()

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <aside className="hidden md:flex w-[220px] flex-col border-r bg-sidebar text-sidebar-foreground h-screen sticky top-0">
      <div className="p-4 font-semibold text-lg flex items-center gap-2">
        <span className="text-2xl">🥗</span>
        NutriTrack
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              }`
            }
            end={item.to === '/'}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-2">
        <Separator className="mb-2" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
            }`
          }
        >
          <User className="h-4 w-4" />
          {user?.full_name || user?.username || 'Профиль'}
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </aside>
  )
}
