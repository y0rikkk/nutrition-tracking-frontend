import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user?.full_name || user?.username || 'Профиль'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Здесь будет карточка пользователя и форма редактирования профиля.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
