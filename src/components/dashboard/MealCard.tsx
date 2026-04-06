import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MealEntryDetailOut, MealType } from '@/types'

const mealConfig: Record<MealType, { icon: string; label: string }> = {
  breakfast: { icon: '🌅', label: 'Завтрак' },
  lunch: { icon: '☀️', label: 'Обед' },
  dinner: { icon: '🌙', label: 'Ужин' },
  snack: { icon: '🍎', label: 'Перекус' },
}

interface MealCardProps {
  mealType: MealType
  meal: MealEntryDetailOut | undefined
  onAddFood: (mealType: MealType, mealId?: string) => void
  onDeleteItem: (itemId: string) => void
}

export function MealCard({ mealType, meal, onAddFood, onDeleteItem }: MealCardProps) {
  const config = mealConfig[mealType]
  const totalCalories = meal?.calories_kcal ?? 0
  const items = meal?.items ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="font-medium">{config.label}</span>
        </div>
        {totalCalories > 0 && (
          <span className="text-sm text-muted-foreground">{Math.round(totalCalories)} ккал</span>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0">
        {items.length > 0 && (
          <div className="flex flex-col gap-1 mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm group">
                <div className="flex-1 min-w-0">
                  <span className="truncate">{item.custom_name}</span>
                  <span className="text-muted-foreground ml-2">{Math.round(item.amount_g)}г</span>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-muted-foreground">{Math.round(item.calories_kcal)} ккал</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => onAddFood(mealType, meal?.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить блюдо
        </Button>
      </CardContent>
    </Card>
  )
}
