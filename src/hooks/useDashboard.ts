import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { mealsApi } from '@/api/meals'
import type { MealType } from '@/types'

export function useDashboard(date: string) {
  return useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => dashboardApi.getByDate(date),
  })
}

type FoodDataFromDB = { food_item_id: string; amount_g: number }
type FoodDataManual = {
  food_item_id: null
  name: string
  amount_g: number
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
}

interface AddFoodItemParams {
  date: string
  mealType: MealType
  existingMealId?: string
  foodData: FoodDataFromDB | FoodDataManual
}

export function useAddFoodItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ date, mealType, existingMealId, foodData }: AddFoodItemParams) => {
      let mealEntryId = existingMealId
      if (!mealEntryId) {
        const existing = await mealsApi.find({ date, meal_type: mealType })
        if (existing.items.length > 0) {
          mealEntryId = existing.items[0].id
        } else {
          const meal = await mealsApi.createMeal({ date, meal_type: mealType })
          mealEntryId = meal.id
        }
      }
      return mealsApi.addFoodItem({ ...foodData, meal_entry_id: mealEntryId } as Parameters<typeof mealsApi.addFoodItem>[0])
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.date] })
    },
  })
}

export function useDeleteFoodItem(date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mealsApi.deleteFoodItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', date] })
    },
  })
}
