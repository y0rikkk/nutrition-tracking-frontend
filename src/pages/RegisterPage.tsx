import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import { registerSchema, type RegisterFormData } from '@/lib/zod-schemas'

const activityLabels: Record<string, string> = {
  sedentary: 'Сидячий образ жизни',
  lightly_active: 'Лёгкая активность',
  moderately_active: 'Умеренная активность',
  very_active: 'Высокая активность',
  extra_active: 'Очень высокая активность',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        full_name: data.full_name || undefined,
      }
      const tokens = await authApi.register(payload)
      setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setUser(user)
      navigate('/')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Ошибка регистрации')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🥗</div>
          <CardTitle className="text-2xl">Регистрация в NutriTrack</CardTitle>
          <CardDescription>Создайте аккаунт для отслеживания питания</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - account */}
              <div className="flex flex-col gap-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Учётные данные
                </h3>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Имя пользователя *</Label>
                  <Input id="username" {...register('username')} placeholder="username" />
                  {errors.username && (
                    <p className="text-destructive text-sm">{errors.username.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <Input id="password" type="password" {...register('password')} placeholder="Минимум 8 символов" />
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input id="full_name" {...register('full_name')} placeholder="Иван Иванов" />
                </div>
              </div>

              {/* Right column - profile */}
              <div className="flex flex-col gap-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Профиль
                </h3>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="birth_date">Дата рождения *</Label>
                  <Input id="birth_date" type="date" {...register('birth_date')} />
                  {errors.birth_date && (
                    <p className="text-destructive text-sm">{errors.birth_date.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Нужна для расчёта рекомендаций</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Пол *</Label>
                  <Select onValueChange={(v) => setValue('gender', v as 'male' | 'female')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пол" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-destructive text-sm">{errors.gender.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="height_cm">Рост (см) *</Label>
                    <Input id="height_cm" type="number" step="0.1" {...register('height_cm')} placeholder="178" />
                    {errors.height_cm && (
                      <p className="text-destructive text-sm">{errors.height_cm.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="weight_kg">Вес (кг) *</Label>
                    <Input id="weight_kg" type="number" step="0.1" {...register('weight_kg')} placeholder="75" />
                    {errors.weight_kg && (
                      <p className="text-destructive text-sm">{errors.weight_kg.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Уровень активности *</Label>
                  <Select onValueChange={(v) => setValue('activity_level', v as RegisterFormData['activity_level'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите уровень" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.activity_level && (
                    <p className="text-destructive text-sm">{errors.activity_level.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Влияет на расчёт суточной нормы КБЖУ</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary underline hover:no-underline">
                Войти
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
