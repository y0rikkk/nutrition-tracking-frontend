import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, UtensilsCrossed, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFoodItems, useCreateFood, useUpdateFood, useDeleteFood } from '@/hooks/useFoodItems'
import { useAddFoodItem } from '@/hooks/useDashboard'
import { useAuthStore } from '@/store/auth'
import { foodItemSchema, type FoodItemFormData } from '@/lib/zod-schemas'
import type { FoodItemOut, MealType } from '@/types'

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function FoodsPage() {
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [editFood, setEditFood] = useState<FoodItemOut | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [addToMeal, setAddToMeal] = useState<FoodItemOut | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { limit: 100, order_by: 'name' }
    if (debouncedSearch) p.name__ilike = debouncedSearch
    return p
  }, [debouncedSearch])

  const { data, isLoading, isError, refetch } = useFoodItems(params)
  const deleteFood = useDeleteFood()

  const items = useMemo(() => {
    if (!data) return []
    if (!onlyMine || !user) return data.items
    return data.items.filter((f) => f.creator?.id === user.id)
  }, [data, onlyMine, user])

  const isOwner = (food: FoodItemOut) => food.creator?.id === user?.id

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Продукты</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить продукт
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="py-3 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            Только мои
          </label>
          {data && (
            <span className="text-sm text-muted-foreground ml-auto">
              Показано: {items.length}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Не удалось загрузить продукты</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">Повторить</Button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Продукты не найдены</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead className="text-right">ккал</TableHead>
                  <TableHead className="text-right">Б</TableHead>
                  <TableHead className="text-right">Ж</TableHead>
                  <TableHead className="text-right">У</TableHead>
                  <TableHead>Создатель</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell className="font-medium">{food.name}</TableCell>
                    <TableCell className="text-muted-foreground">{food.brand || '—'}</TableCell>
                    <TableCell className="text-right">{food.calories_per_100g}</TableCell>
                    <TableCell className="text-right">{food.protein_per_100g}</TableCell>
                    <TableCell className="text-right">{food.fat_per_100g}</TableCell>
                    <TableCell className="text-right">{food.carbs_per_100g}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{food.creator?.username || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Добавить в приём пищи"
                          onClick={() => setAddToMeal(food)}
                        >
                          <UtensilsCrossed className="h-3.5 w-3.5" />
                        </Button>
                        {isOwner(food) && (
                          <>
                            <Button
                              variant="ghost"
                              size="xs"
                              title="Редактировать"
                              onClick={() => setEditFood(food)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-muted-foreground hover:text-destructive"
                              title="Удалить"
                              onClick={() => {
                                deleteFood.mutate(food.id, {
                                  onSuccess: () => toast.success('Продукт удалён'),
                                  onError: () => toast.error('Ошибка при удалении'),
                                })
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <FoodFormDialog
        open={showCreate || !!editFood}
        onOpenChange={(open) => {
          if (!open) { setShowCreate(false); setEditFood(null) }
        }}
        food={editFood}
      />

      {/* Add to meal dialog */}
      {addToMeal && (
        <AddToMealDialog
          open={!!addToMeal}
          onOpenChange={(open) => !open && setAddToMeal(null)}
          food={addToMeal}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Food Create/Edit Dialog                                             */
/* ------------------------------------------------------------------ */

function FoodFormDialog({
  open,
  onOpenChange,
  food,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  food: FoodItemOut | null
}) {
  const createFood = useCreateFood()
  const updateFood = useUpdateFood()
  const isEdit = !!food

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FoodItemFormData>({
    resolver: zodResolver(foodItemSchema),
  })

  useEffect(() => {
    if (food) {
      reset({
        name: food.name,
        brand: food.brand || '',
        calories_per_100g: food.calories_per_100g,
        protein_per_100g: food.protein_per_100g,
        fat_per_100g: food.fat_per_100g,
        carbs_per_100g: food.carbs_per_100g,
        barcode: food.barcode || '',
      })
    } else {
      reset({
        name: '',
        brand: '',
        calories_per_100g: 0,
        protein_per_100g: 0,
        fat_per_100g: 0,
        carbs_per_100g: 0,
        barcode: '',
      })
    }
  }, [food, reset])

  const onSubmit = async (data: FoodItemFormData) => {
    try {
      if (isEdit) {
        await updateFood.mutateAsync({
          id: food.id,
          data: {
            ...data,
            brand: data.brand || null,
            barcode: data.barcode || null,
          },
        })
        toast.success('Продукт обновлён')
      } else {
        await createFood.mutateAsync({
          ...data,
          brand: data.brand || null,
          barcode: data.barcode || null,
        })
        toast.success('Продукт создан')
      }
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? 'Ошибка при обновлении' : 'Ошибка при создании')
    }
  }

  const isPending = createFood.isPending || updateFood.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать продукт' : 'Новый продукт'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Название *</Label>
            <Input {...register('name')} placeholder="Куриная грудка" />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Label>Бренд</Label>
            <Input {...register('brand')} placeholder="Необязательно" />
          </div>
          <p className="text-xs text-muted-foreground">Значения на 100г:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label>Калории (ккал)</Label>
              <Input type="number" step="0.1" {...register('calories_per_100g')} />
              {errors.calories_per_100g && <p className="text-destructive text-xs">{errors.calories_per_100g.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Белки (г)</Label>
              <Input type="number" step="0.1" {...register('protein_per_100g')} />
              {errors.protein_per_100g && <p className="text-destructive text-xs">{errors.protein_per_100g.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Жиры (г)</Label>
              <Input type="number" step="0.1" {...register('fat_per_100g')} />
              {errors.fat_per_100g && <p className="text-destructive text-xs">{errors.fat_per_100g.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>Углеводы (г)</Label>
              <Input type="number" step="0.1" {...register('carbs_per_100g')} />
              {errors.carbs_per_100g && <p className="text-destructive text-xs">{errors.carbs_per_100g.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Штрих-код</Label>
            <Input {...register('barcode')} placeholder="Необязательно" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Add to Meal Dialog                                                  */
/* ------------------------------------------------------------------ */

function AddToMealDialog({
  open,
  onOpenChange,
  food,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  food: FoodItemOut
}) {
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [amountG, setAmountG] = useState(100)
  const addFoodItem = useAddFoodItem()

  const calc = (per100: number) => (per100 * amountG) / 100

  const handleAdd = async () => {
    try {
      await addFoodItem.mutateAsync({
        date: todayStr(),
        mealType,
        foodData: {
          food_item_id: food.id,
          amount_g: amountG,
        },
      })
      toast.success(`Добавлено в ${mealTypeLabels[mealType].toLowerCase()}`)
      onOpenChange(false)
    } catch {
      toast.error('Ошибка при добавлении')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Добавить в приём пищи</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-medium">{food.name}</p>
            {food.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Приём пищи</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(mealTypeLabels) as [MealType, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Количество (г)</Label>
            <Input
              type="number"
              value={amountG}
              onChange={(e) => setAmountG(parseFloat(e.target.value) || 0)}
              min={1}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="text-muted-foreground text-xs">ккал</div>
              <div className="font-medium">{calc(food.calories_per_100g).toFixed(0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Белки</div>
              <div className="font-medium">{calc(food.protein_per_100g).toFixed(1)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Жиры</div>
              <div className="font-medium">{calc(food.fat_per_100g).toFixed(1)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Углеводы</div>
              <div className="font-medium">{calc(food.carbs_per_100g).toFixed(1)}</div>
            </div>
          </div>

          <Button onClick={handleAdd} disabled={addFoodItem.isPending || amountG <= 0}>
            {addFoodItem.isPending ? 'Добавление...' : 'Добавить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
