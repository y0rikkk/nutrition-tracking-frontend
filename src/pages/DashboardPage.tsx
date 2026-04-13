import { useState } from 'react'
import { ChevronLeft, ChevronRight, Weight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CalorieRing } from '@/components/dashboard/CalorieRing'
import { MealCard } from '@/components/dashboard/MealCard'
import { AddFoodDialog } from '@/components/dashboard/AddFoodDialog'
import { useDashboard, useDeleteFoodItem } from '@/hooks/useDashboard'
import type { MealType } from '@/types'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateRu(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const [date, setDate] = useState(todayStr)
  const [addFoodState, setAddFoodState] = useState<{ mealType: MealType; mealId?: string } | null>(null)

  const { data: dashboard, isLoading, isError, refetch } = useDashboard(date)
  const deleteMutation = useDeleteFoodItem(date)

  const handleAddFood = (mealType: MealType, mealId?: string) => {
    setAddFoodState({ mealType, mealId })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 max-w-5xl">
        <div className="flex flex-col gap-4">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-[220px] bg-muted rounded animate-pulse" />
          <div className="h-[140px] bg-muted rounded animate-pulse" />
          <div className="h-[80px] bg-muted rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[100px] bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !dashboard) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <p className="text-muted-foreground mb-4">Не удалось загрузить данные</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    )
  }

  const gp = dashboard.goal_progress

  return (
    <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 max-w-5xl">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        {/* Date nav */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setDate(shiftDate(date, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <button
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setDate(todayStr())}
          >
            {formatDateRu(date)}
          </button>
          {date < todayStr() ? (
            <Button variant="ghost" size="icon" onClick={() => setDate(shiftDate(date, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Calorie ring */}
        <CalorieRing
          consumed={dashboard.consumed.calories_kcal}
          goal={dashboard.goal?.calories_kcal ?? 0}
        />

        {/* Macro bars */}
        <Card>
          <CardContent className="py-4 flex flex-col gap-3">
            {gp ? (
              <>
                <MacroBar label="Белки" consumed={gp.protein.consumed} goal={gp.protein.goal} percent={gp.protein.percent} color="oklch(0.65 0.15 145)" />
                <MacroBar label="Жиры" consumed={gp.fat.consumed} goal={gp.fat.goal} percent={gp.fat.percent} color="oklch(0.7 0.15 55)" />
                <MacroBar label="Углеводы" consumed={gp.carbs.consumed} goal={gp.carbs.goal} percent={gp.carbs.percent} color="oklch(0.65 0.15 260)" />
              </>
            ) : (
              <>
                <MacroBarSimple label="Белки" value={dashboard.consumed.protein_g} />
                <MacroBarSimple label="Жиры" value={dashboard.consumed.fat_g} />
                <MacroBarSimple label="Углеводы" value={dashboard.consumed.carbs_g} />
                <p className="text-xs text-muted-foreground text-center">Задайте цель для отслеживания прогресса</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Weight card */}
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Weight className="h-5 w-5 text-muted-foreground" />
            {dashboard.latest_weight ? (
              <div>
                <span className="font-medium">{dashboard.latest_weight.weight_kg} кг</span>
                <p className="text-xs text-muted-foreground">
                  обновлено {new Date(dashboard.latest_weight.date + 'T12:00:00').toLocaleDateString('ru-RU')}
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Нет данных о весе</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        {MEAL_TYPES.map((type) => (
          <MealCard
            key={type}
            mealType={type}
            meal={dashboard.meals.find((m) => m.meal_type === type)}
            onAddFood={handleAddFood}
            onDeleteItem={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Add food dialog */}
      {addFoodState && (
        <AddFoodDialog
          open={!!addFoodState}
          onOpenChange={(open) => !open && setAddFoodState(null)}
          mealType={addFoodState.mealType}
          mealId={addFoodState.mealId}
          date={date}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Macro progress bar helpers                                          */
/* ------------------------------------------------------------------ */

function MacroBar({
  label,
  consumed,
  goal,
  percent,
  color,
}: {
  label: string
  consumed: number
  goal: number
  percent: number
  color: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {Math.round(consumed)}г / {Math.round(goal)}г
        </span>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        className="h-2"
        style={{ '--progress-foreground': color } as React.CSSProperties}
      />
    </div>
  )
}

function MacroBarSimple({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{Math.round(value)}г</span>
    </div>
  )
}
