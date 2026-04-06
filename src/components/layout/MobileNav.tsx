import { NavLink } from 'react-router-dom'
import { Home, Weight, Target, Lightbulb, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Дашборд' },
  { to: '/weight', icon: Weight, label: 'Вес' },
  { to: '/goals', icon: Target, label: 'Цели' },
  { to: '/advice', icon: Lightbulb, label: 'Советы' },
  { to: '/profile', icon: User, label: 'Профиль' },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`
            }
            end={item.to === '/'}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
