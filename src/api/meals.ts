import client from './client'
import type { MealEntryDetailOut, MealFoodItemOut, MealType, PagedResponse } from '@/types'

export interface CreateMealFoodItemFromDB {
  meal_entry_id: string
  food_item_id: string
  amount_g: number
}

export interface CreateMealFoodItemManual {
  meal_entry_id: string
  food_item_id: null
  name: string
  amount_g: number
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
}

export type CreateMealFoodItemRequest = CreateMealFoodItemFromDB | CreateMealFoodItemManual

export const mealsApi = {
  find(params: { date: string; meal_type: MealType }): Promise<PagedResponse<MealEntryDetailOut>> {
    return client.get('/meals/', { params }).then((r) => r.data)
  },

  createMeal(data: { date: string; meal_type: MealType }): Promise<MealEntryDetailOut> {
    return client.post('/meals/', data).then((r) => r.data)
  },

  addFoodItem(data: CreateMealFoodItemRequest): Promise<MealFoodItemOut> {
    return client.post('/meal-items/', data).then((r) => r.data)
  },

  deleteFoodItem(id: string): Promise<void> {
    return client.delete(`/meal-items/${id}/`)
  },
}
