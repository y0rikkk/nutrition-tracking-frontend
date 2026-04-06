import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { mealsApi } from '@/api/meals'
import type { CreateMealFoodItemRequest } from '@/api/meals'
import type { MealType } from '@/types'

export function useDashboard(date: string) {
  return useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => dashboardApi.getByDate(date),
  })
}

interface AddFoodItemParams {
  date: string
  mealType: MealType
  existingMealId?: string
  foodData: Omit<CreateMealFoodItemRequest, 'meal_entry_id'>
}

export function useAddFoodItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ date, mealType, existingMealId, foodData }: AddFoodItemParams) => {
      let mealEntryId = existingMealId
      if (!mealEntryId) {
        const meal = await mealsApi.createMeal({ date, meal_type: mealType })
        mealEntryId = meal.id
      }
      return mealsApi.addFoodItem({ ...foodData, meal_entry_id: mealEntryId } as CreateMealFoodItemRequest)
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
