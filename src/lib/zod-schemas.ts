import { z } from 'zod'

const coerceNumber = () => z.union([z.number(), z.string().transform(Number)]).pipe(z.number())

export const loginSchema = z.object({
  username: z.string().min(1, 'Введите имя пользователя'),
  password: z.string().min(1, 'Введите пароль'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  username: z.string().min(1, 'Введите имя пользователя'),
  password: z.string().min(8, 'Минимум 8 символов'),
  email: z.string().email('Некорректный email').or(z.literal('')).optional(),
  full_name: z.string().optional(),
  birth_date: z.string().min(1, 'Укажите дату рождения'),
  gender: z.enum(['male', 'female'], { message: 'Выберите пол' }),
  height_cm: coerceNumber().pipe(z.number().min(50, 'Мин. 50 см').max(300, 'Макс. 300 см')),
  weight_kg: coerceNumber().pipe(z.number().min(20, 'Мин. 20 кг').max(500, 'Макс. 500 кг')),
  activity_level: z.enum(
    ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
    { message: 'Выберите уровень активности' },
  ),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const manualFoodSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  amount_g: coerceNumber().pipe(z.number().min(1, 'Мин. 1 г')),
  calories_kcal: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  protein_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  fat_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  carbs_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
})

export type ManualFoodFormData = z.infer<typeof manualFoodSchema>

export const weightSchema = z.object({
  date: z.string().min(1, 'Укажите дату'),
  weight_kg: coerceNumber().pipe(z.number().min(20, 'Мин. 20 кг').max(500, 'Макс. 500 кг')),
  notes: z.string().optional(),
})

export type WeightFormData = z.infer<typeof weightSchema>

export const goalSchema = z.object({
  calories_kcal: coerceNumber().pipe(z.number().min(1, 'Укажите калории')),
  protein_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  fat_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  carbs_g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  started_at: z.string().min(1, 'Укажите дату'),
  notes: z.string().optional(),
})

export type GoalFormData = z.infer<typeof goalSchema>

export const profileSchema = z.object({
  birth_date: z.string().min(1, 'Укажите дату рождения'),
  gender: z.enum(['male', 'female']),
  height_cm: coerceNumber().pipe(z.number().min(50, 'Мин. 50 см').max(300, 'Макс. 300 см')),
  weight_kg: coerceNumber().pipe(z.number().min(20, 'Мин. 20 кг').max(500, 'Макс. 500 кг')),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const foodItemSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  brand: z.string().optional(),
  calories_per_100g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  protein_per_100g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  fat_per_100g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  carbs_per_100g: coerceNumber().pipe(z.number().min(0, 'Мин. 0')),
  barcode: z.string().optional(),
})

export type FoodItemFormData = z.infer<typeof foodItemSchema>
