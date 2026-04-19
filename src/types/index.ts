export type GenderEnum = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserOut {
  id: string
  username: string
  email: string | null
  full_name: string | null
  is_superuser: boolean
  birth_date: string
  gender: GenderEnum
  height_cm: number
  weight_kg: number
  activity_level: ActivityLevel
  created_at: string
  updated_at: string
}

export interface UserShort {
  id: string
  username: string
}

export interface FoodItemOut {
  id: string
  name: string
  brand: string | null
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  barcode: string | null
  created_at: string
  updated_at: string
  creator: UserShort | null
  modifier: UserShort | null
}

export interface MealFoodItemOut {
  id: string
  meal_entry_id: string
  food_item_id: string | null
  name: string | null
  amount_g: number
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
  created_at: string
  updated_at: string
}

export interface MealEntryOut {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  notes: string | null
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
  created_at: string
  updated_at: string
}

export interface MealEntryDetailOut extends MealEntryOut {
  items: MealFoodItemOut[]
}

export interface NutritionGoalOut {
  id: string
  user_id: string
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
  is_active: boolean
  started_at: string
  ended_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeightLogOut {
  id: string
  user_id: string
  date: string
  weight_kg: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MacroTotals {
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
}

export interface MacroProgress {
  consumed: number
  goal: number
  remaining: number
  percent: number
}

export interface DashboardOut {
  date: string
  consumed: MacroTotals
  goal: NutritionGoalOut | null
  goal_progress: {
    calories: MacroProgress
    protein: MacroProgress
    fat: MacroProgress
    carbs: MacroProgress
  } | null
  meal_breakdown: Array<{ meal_type: MealType; totals: MacroTotals }>
  meals: MealEntryDetailOut[]
}

export interface RecognizedDish {
  name: string
  amount_g: number
  calories_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
}

export interface PagedResponse<T> {
  items: T[]
  count: number
}
