import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { profileSchema, type ProfileFormData } from '@/lib/zod-schemas'

const activityLabels: Record<string, string> = {
  sedentary: 'Сидячий образ жизни',
  lightly_active: 'Лёгкая активность',
  moderately_active: 'Умеренная активность',
  very_active: 'Высокая активность',
  extra_active: 'Очень высокая активность',
}

const genderLabels: Record<string, string> = {
  male: 'Мужской',
  female: 'Женский',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout, refreshToken } = useAuthStore()
  const { data: user, isLoading, isError, refetch } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        birth_date: user.birth_date,
        gender: user.gender,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        activity_level: user.activity_level,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Профиль обновлён')
    } catch {
      toast.error('Ошибка при обновлении профиля')
    }
  }

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const initials = user
    ? (user.full_name || user.username).slice(0, 2).toUpperCase()
    : '??'

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[250px] bg-muted rounded animate-pulse" />
          <div className="h-[400px] bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-3">Не удалось загрузить профиль</p>
            <Button onClick={() => refetch()} variant="outline">Повторить</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Профиль</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left — user card */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="py-6 flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">{user?.full_name || user?.username}</p>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Пол</span>
                  <span>{user ? genderLabels[user.gender] : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Рост</span>
                  <span>{user ? `${user.height_cm} см` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Вес</span>
                  <span>{user ? `${user.weight_kg} кг` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Активность</span>
                  <span>{user ? activityLabels[user.activity_level] : '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>

        {/* Right — edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Редактировать профиль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label>Дата рождения</Label>
                <Input type="date" {...register('birth_date')} />
                {errors.birth_date && <p className="text-destructive text-xs">{errors.birth_date.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Пол</Label>
                <Select
                  value={user?.gender}
                  onValueChange={(v) => setValue('gender', v as 'male' | 'female', { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-destructive text-xs">{errors.gender.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Рост (см)</Label>
                  <Input type="number" step="0.1" {...register('height_cm')} />
                  {errors.height_cm && <p className="text-destructive text-xs">{errors.height_cm.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Вес (кг)</Label>
                  <Input type="number" step="0.1" {...register('weight_kg')} />
                  {errors.weight_kg && <p className="text-destructive text-xs">{errors.weight_kg.message}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Уровень активности</Label>
                <Select
                  value={user?.activity_level}
                  onValueChange={(v) => setValue('activity_level', v as ProfileFormData['activity_level'], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.activity_level && <p className="text-destructive text-xs">{errors.activity_level.message}</p>}
              </div>

              <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
                {updateProfile.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
