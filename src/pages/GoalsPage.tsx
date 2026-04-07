import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGoals, useCreateGoal, useUpdateGoal } from '@/hooks/useGoals'
import { goalSchema, type GoalFormData } from '@/lib/zod-schemas'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('ru-RU')
}

export default function GoalsPage() {
  const { data, isLoading, isError, refetch } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const [showForm, setShowForm] = useState(false)

  const goals = data?.items ?? []
  const activeGoal = goals.find((g) => g.is_active)
  const pastGoals = goals.filter((g) => !g.is_active)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { started_at: todayStr() },
  })

  const onSubmit = async (formData: GoalFormData) => {
    try {
      await createGoal.mutateAsync({
        ...formData,
        notes: formData.notes || null,
      })
      toast.success('Цель создана')
      setShowForm(false)
      reset({ started_at: todayStr() })
    } catch {
      toast.error('Ошибка при создании цели')
    }
  }

  const handleDeactivate = async () => {
    if (!activeGoal) return
    try {
      await updateGoal.mutateAsync({ id: activeGoal.id, data: { is_active: false } })
      toast.success('Цель деактивирована')
    } catch {
      toast.error('Ошибка при деактивации')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Цели по КБЖУ</h1>

      {isError && (
        <Card className="mb-4">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-3">Не удалось загрузить цели</p>
            <Button onClick={() => refetch()} variant="outline">Повторить</Button>
          </CardContent>
        </Card>
      )}

      {/* Active goal */}
      {activeGoal ? (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Текущая цель</CardTitle>
            <Badge variant="secondary">Активна</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-semibold">{Math.round(activeGoal.calories_kcal)}</div>
                <div className="text-xs text-muted-foreground">ккал</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{Math.round(activeGoal.protein_g)}</div>
                <div className="text-xs text-muted-foreground">Белки (г)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{Math.round(activeGoal.fat_g)}</div>
                <div className="text-xs text-muted-foreground">Жиры (г)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{Math.round(activeGoal.carbs_g)}</div>
                <div className="text-xs text-muted-foreground">Углеводы (г)</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>С {formatDate(activeGoal.started_at)}</span>
              {activeGoal.notes && <span>{activeGoal.notes}</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDeactivate} disabled={updateGoal.isPending}>
                Деактивировать
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6 text-center text-muted-foreground">
            Активная цель не задана
          </CardContent>
        </Card>
      )}

      {/* New goal form */}
      {!showForm ? (
        <Button className="mb-6" onClick={() => setShowForm(true)}>
          Новая цель
        </Button>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Новая цель</CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoal && (
              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm p-3 rounded-md mb-4">
                Предыдущая цель будет автоматически деактивирована
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Калории (ккал)</Label>
                  <Input type="number" {...register('calories_kcal')} placeholder="2200" />
                  {errors.calories_kcal && <p className="text-destructive text-xs">{errors.calories_kcal.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Белки (г)</Label>
                  <Input type="number" step="0.1" {...register('protein_g')} placeholder="160" />
                  {errors.protein_g && <p className="text-destructive text-xs">{errors.protein_g.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Жиры (г)</Label>
                  <Input type="number" step="0.1" {...register('fat_g')} placeholder="70" />
                  {errors.fat_g && <p className="text-destructive text-xs">{errors.fat_g.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Углеводы (г)</Label>
                  <Input type="number" step="0.1" {...register('carbs_g')} placeholder="230" />
                  {errors.carbs_g && <p className="text-destructive text-xs">{errors.carbs_g.message}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Дата начала</Label>
                <Input type="date" {...register('started_at')} />
                {errors.started_at && <p className="text-destructive text-xs">{errors.started_at.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Заметка</Label>
                <Input {...register('notes')} placeholder="Снижение веса..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? 'Создание...' : 'Создать'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Past goals */}
      {pastGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">История целей</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Период</TableHead>
                  <TableHead>ккал</TableHead>
                  <TableHead>Б/Ж/У</TableHead>
                  <TableHead>Заметка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastGoals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="text-sm">
                      {formatDate(goal.started_at)}
                      {goal.ended_at && ` — ${formatDate(goal.ended_at)}`}
                    </TableCell>
                    <TableCell className="text-sm">{Math.round(goal.calories_kcal)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {Math.round(goal.protein_g)} / {Math.round(goal.fat_g)} / {Math.round(goal.carbs_g)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{goal.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Загрузка...</p>}
    </div>
  )
}
