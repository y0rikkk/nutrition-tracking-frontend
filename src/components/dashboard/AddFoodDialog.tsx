import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Search, Pencil, ArrowLeft, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddFoodItem } from '@/hooks/useDashboard'
import { useFoodSearch, useAnalyzePhoto } from '@/hooks/useFoods'
import { manualFoodSchema, type ManualFoodFormData } from '@/lib/zod-schemas'
import type { FoodItemOut, MealType, RecognizedDish } from '@/types'

type Step = 'choose' | 'photo' | 'search' | 'manual'

interface AddFoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: MealType
  mealId: string | undefined
  date: string
}

export function AddFoodDialog({ open, onOpenChange, mealType, mealId, date }: AddFoodDialogProps) {
  const [step, setStep] = useState<Step>('choose')
  const addFoodItem = useAddFoodItem()

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setStep('choose'), 200)
  }

  const handleAdded = () => {
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'choose' && 'Добавить блюдо'}
            {step === 'photo' && 'Распознать по фото'}
            {step === 'search' && 'Найти в базе'}
            {step === 'manual' && 'Ввести вручную'}
          </DialogTitle>
        </DialogHeader>

        {step !== 'choose' && (
          <Button variant="ghost" size="sm" className="w-fit -mt-2" onClick={() => setStep('choose')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
        )}

        {step === 'choose' && <ChooseStep onSelect={setStep} />}
        {step === 'photo' && (
          <PhotoStep mutation={addFoodItem} mealType={mealType} mealId={mealId} date={date} onDone={handleAdded} />
        )}
        {step === 'search' && (
          <SearchStep mutation={addFoodItem} mealType={mealType} mealId={mealId} date={date} onDone={handleAdded} />
        )}
        {step === 'manual' && (
          <ManualStep mutation={addFoodItem} mealType={mealType} mealId={mealId} date={date} onDone={handleAdded} />
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Step: Choose method                                                 */
/* ------------------------------------------------------------------ */

function ChooseStep({ onSelect }: { onSelect: (step: Step) => void }) {
  const options = [
    { step: 'photo' as Step, icon: Camera, label: 'Сфотографировать', desc: 'AI распознает блюда на фото' },
    { step: 'search' as Step, icon: Search, label: 'Найти в базе', desc: 'Поиск по названию продукта' },
    { step: 'manual' as Step, icon: Pencil, label: 'Ввести вручную', desc: 'Указать название и КБЖУ' },
  ]

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.step}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
          onClick={() => onSelect(opt.step)}
        >
          <opt.icon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <div className="font-medium text-sm">{opt.label}</div>
            <div className="text-xs text-muted-foreground">{opt.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step: Photo analysis (multi-select)                                 */
/* ------------------------------------------------------------------ */

interface StepProps {
  mutation: ReturnType<typeof useAddFoodItem>
  mealType: MealType
  mealId: string | undefined
  date: string
  onDone: () => void
}

function convertToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to convert image'))
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.9,
      )
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}

function PhotoStep({ mutation, mealType, mealId, date, onDone }: StepProps) {
  const analyzePhoto = useAnalyzePhoto()
  const [dishes, setDishes] = useState<RecognizedDish[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const jpeg = file.type === 'image/jpeg' ? file : await convertToJpeg(file)
      const result = await analyzePhoto.mutateAsync(jpeg)
      setDishes(result.dishes)
      setSelected(new Set(result.dishes.map((_, i) => i)))
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (status === 502) {
        toast.error('Ошибка при обращении к ИИ сервису. Попробуйте ещё раз через минуту')
      } else if (detail) {
        toast.error(detail)
      } else {
        toast.error('Не удалось распознать блюда')
      }
    }
  }

  const handleUpdateDish = (index: number, field: keyof RecognizedDish, value: string) => {
    if (!dishes) return
    const updated = [...dishes]
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' ? value : parseFloat(value) || 0,
    }
    setDishes(updated)
  }

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleAddSelected = async () => {
    if (!dishes || selected.size === 0) return
    setIsAdding(true)
    let mealEntryId = mealId
    try {
      for (const i of selected) {
        const dish = dishes[i]
        const result = await mutation.mutateAsync({
          date,
          mealType,
          existingMealId: mealEntryId,
          foodData: {
            food_item_id: null,
            custom_name: dish.name,
            amount_g: dish.amount_g,
            calories_kcal: dish.calories_kcal,
            protein_g: dish.protein_g,
            fat_g: dish.fat_g,
            carbs_g: dish.carbs_g,
          },
        })
        if (!mealEntryId) mealEntryId = result.meal_entry_id
      }
      toast.success(`Добавлено блюд: ${selected.size}`)
      onDone()
    } catch {
      toast.error('Ошибка при добавлении')
    } finally {
      setIsAdding(false)
    }
  }

  if (analyzePhoto.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Анализируем фото...</p>
        <p className="text-xs text-muted-foreground">Это может занять 10-30 секунд</p>
      </div>
    )
  }

  if (!dishes) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div
          className="border-2 border-dashed rounded-lg p-8 w-full flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Нажмите для загрузки фото</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP или HEIF</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Найдено блюд: {dishes.length}. Отметьте нужные и добавьте.</p>
      {dishes.map((dish, i) => (
        <div
          key={i}
          className={`border rounded-lg p-3 flex flex-col gap-2 transition-colors ${selected.has(i) ? 'border-primary/50 bg-primary/5' : 'opacity-60'}`}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={() => toggleSelect(i)}
              className="h-4 w-4 rounded"
            />
            <Input
              value={dish.name}
              onChange={(e) => handleUpdateDish(i, 'name', e.target.value)}
              className="font-medium"
            />
          </label>
          <div className="grid grid-cols-5 gap-2">
            {([
              ['amount_g', 'г'],
              ['calories_kcal', 'ккал'],
              ['protein_g', 'Б'],
              ['fat_g', 'Ж'],
              ['carbs_g', 'У'],
            ] as const).map(([field, label]) => (
              <div key={field} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground text-center">{label}</span>
                <Input
                  type="number"
                  step="0.1"
                  value={dish[field]}
                  onChange={(e) => handleUpdateDish(i, field, e.target.value)}
                  className="text-center text-sm h-8"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button className="w-full" onClick={handleAddSelected} disabled={isAdding || selected.size === 0}>
        {isAdding ? 'Добавление...' : `Добавить выбранные (${selected.size})`}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step: Search database                                               */
/* ------------------------------------------------------------------ */

function SearchStep({ mutation, mealType, mealId, date, onDone }: StepProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItemOut | null>(null)
  const [amountG, setAmountG] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchResults, isLoading: isSearching } = useFoodSearch(debouncedQuery)

  const calc = (per100: number) => (per100 * amountG) / 100

  const handleAdd = async () => {
    if (!selectedFood) return
    try {
      await mutation.mutateAsync({
        date,
        mealType,
        existingMealId: mealId,
        foodData: {
          food_item_id: selectedFood.id,
          amount_g: amountG,
        },
      })
      toast.success('Блюдо добавлено')
      onDone()
    } catch {
      toast.error('Ошибка при добавлении')
    }
  }

  if (selectedFood) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => setSelectedFood(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          К результатам
        </Button>

        <div>
          <p className="font-medium">{selectedFood.name}</p>
          {selectedFood.brand && <p className="text-sm text-muted-foreground">{selectedFood.brand}</p>}
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
            <div className="text-muted-foreground text-xs">Калории</div>
            <div className="font-medium">{calc(selectedFood.calories_per_100g).toFixed(0)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Белки</div>
            <div className="font-medium">{calc(selectedFood.protein_per_100g).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Жиры</div>
            <div className="font-medium">{calc(selectedFood.fat_per_100g).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Углеводы</div>
            <div className="font-medium">{calc(selectedFood.carbs_per_100g).toFixed(1)}</div>
          </div>
        </div>

        <Button onClick={handleAdd} disabled={mutation.isPending || amountG <= 0}>
          {mutation.isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Название продукта..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Поиск...
        </div>
      )}

      {searchResults && searchResults.items.length === 0 && debouncedQuery.length >= 2 && (
        <p className="text-sm text-muted-foreground text-center py-4">Ничего не найдено</p>
      )}

      {searchResults && searchResults.items.length > 0 && (
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          {searchResults.items.map((food) => (
            <button
              key={food.id}
              className="flex flex-col p-2 rounded-md hover:bg-accent transition-colors text-left"
              onClick={() => {
                setSelectedFood(food)
                setAmountG(100)
              }}
            >
              <span className="text-sm font-medium">{food.name}</span>
              <span className="text-xs text-muted-foreground">
                на 100г: {food.calories_per_100g} ккал / {food.protein_per_100g}б {food.fat_per_100g}ж {food.carbs_per_100g}у
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step: Manual entry                                                  */
/* ------------------------------------------------------------------ */

function ManualStep({ mutation, mealType, mealId, date, onDone }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualFoodFormData>({
    resolver: zodResolver(manualFoodSchema),
  })

  const onSubmit = async (data: ManualFoodFormData) => {
    try {
      await mutation.mutateAsync({
        date,
        mealType,
        existingMealId: mealId,
        foodData: {
          food_item_id: null,
          custom_name: data.custom_name,
          amount_g: data.amount_g,
          calories_kcal: data.calories_kcal,
          protein_g: data.protein_g,
          fat_g: data.fat_g,
          carbs_g: data.carbs_g,
        },
      })
      toast.success('Блюдо добавлено')
      onDone()
    } catch {
      toast.error('Ошибка при добавлении')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label>Название</Label>
        <Input {...register('custom_name')} placeholder="Домашний борщ" />
        {errors.custom_name && <p className="text-destructive text-xs">{errors.custom_name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>Количество (г)</Label>
        <Input type="number" step="0.1" {...register('amount_g')} placeholder="200" />
        {errors.amount_g && <p className="text-destructive text-xs">{errors.amount_g.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Калории (ккал)</Label>
          <Input type="number" step="0.1" {...register('calories_kcal')} placeholder="150" />
          {errors.calories_kcal && <p className="text-destructive text-xs">{errors.calories_kcal.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Белки (г)</Label>
          <Input type="number" step="0.1" {...register('protein_g')} placeholder="8" />
          {errors.protein_g && <p className="text-destructive text-xs">{errors.protein_g.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Жиры (г)</Label>
          <Input type="number" step="0.1" {...register('fat_g')} placeholder="5" />
          {errors.fat_g && <p className="text-destructive text-xs">{errors.fat_g.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Углеводы (г)</Label>
          <Input type="number" step="0.1" {...register('carbs_g')} placeholder="18" />
          {errors.carbs_g && <p className="text-destructive text-xs">{errors.carbs_g.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление...' : 'Добавить'}
      </Button>
    </form>
  )
}
