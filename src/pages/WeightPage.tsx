import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWeightLogs, useAddWeight, useDeleteWeight } from '@/hooks/useWeight'
import { useAuthStore } from '@/store/auth'
import { weightSchema, type WeightFormData } from '@/lib/zod-schemas'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function WeightPage() {
  const { data, isLoading } = useWeightLogs()
  const addWeight = useAddWeight()
  const deleteWeight = useDeleteWeight()
  const user = useAuthStore((s) => s.user)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: { date: todayStr() },
  })

  const onSubmit = async (formData: WeightFormData) => {
    try {
      await addWeight.mutateAsync({
        date: formData.date,
        weight_kg: formData.weight_kg,
        notes: formData.notes || null,
      })
      toast.success('Замер добавлен')
      reset({ date: todayStr() })
    } catch {
      toast.error('Ошибка при добавлении')
    }
  }

  const logs = data?.items ?? []
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : null
  const initialWeight = user?.weight_kg ?? null
  const diff = currentWeight && initialWeight ? currentWeight - initialWeight : null

  const chartData = logs.slice(-30).map((log) => ({
    date: new Date(log.date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    weight: log.weight_kg,
  }))

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Вес</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Add form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Добавить замер</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Дата</Label>
                  <Input type="date" {...register('date')} />
                  {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Вес (кг)</Label>
                  <Input type="number" step="0.1" {...register('weight_kg')} placeholder="75.0" />
                  {errors.weight_kg && <p className="text-destructive text-xs">{errors.weight_kg.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Заметка</Label>
                  <Input {...register('notes')} placeholder="После тренировки..." />
                </div>
                <Button type="submit" disabled={addWeight.isPending}>
                  {addWeight.isPending ? 'Добавление...' : 'Добавить'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Начальный вес</span>
                <span>{initialWeight ? `${initialWeight} кг` : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Текущий вес</span>
                <span>{currentWeight ? `${currentWeight} кг` : '—'}</span>
              </div>
              {diff !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Разница</span>
                  <span className="flex items-center gap-1">
                    {diff > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : diff < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Minus className="h-3.5 w-3.5" />
                    )}
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} кг
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">График веса</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Вес (кг)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {isLoading ? 'Загрузка...' : 'Недостаточно данных для графика'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История замеров</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Вес</TableHead>
                      <TableHead>Заметка</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...logs].reverse().map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{log.weight_kg} кг</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.notes || '—'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                            onClick={() => deleteWeight.mutate(log.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isLoading ? 'Загрузка...' : 'Нет записей'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
