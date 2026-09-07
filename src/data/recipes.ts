import categoriesData from './categories.json'

export type MealCategory = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'
export type RecipeOrigin = 'curated' | 'mine'
export type RecipeLanguage = 'en' | 'fr'
export type ScalableIngredient = { quantity: number; unit: string; name: string }
export type TranslatedContent = {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  notes?: string
}

export type Recipe = {
  id: string
  categories: MealCategory[]
  origin: RecipeOrigin
  language: RecipeLanguage
  title: string
  description: string
  image: string
  time: number
  calories: number
  protein: number
  carbs: number
  tags: string[]
  ingredients: string[]
  steps: string[]
  source: { label: string; url: string }
  /** Short coach's tip — why this recipe works, or how/when to use it. */
  notes?: string
  /** Data-only for now — reserved for a future "Batch cooking" filter, not
   * yet surfaced in the UI (see backlog). */
  batchCooking?: boolean
  /** Default serving count this recipe's macros/ingredients are written for. */
  servings?: number
  /** Structured ingredients enabling the servings scaler; falls back to the
   * static `ingredients` list when absent (most recipes, for now). */
  scalableIngredients?: ScalableIngredient[]
  /** Optional full-content overrides per language, keyed by UI language code.
   * When the active UI language differs from `language` and a matching entry
   * exists here, the app displays this instead of the primary content. */
  translations?: Partial<Record<RecipeLanguage, TranslatedContent>>
}

// Each recipe lives in its own JSON file under ./recipes-json — one file per
// recipe keeps AI-agent edits and PR diffs isolated to the recipe being changed.
const recipeModules = import.meta.glob<Recipe>('./recipes-json/*.json', {
  eager: true,
  import: 'default',
})

export const recipes: Recipe[] = Object.values(recipeModules).sort((a, b) => a.id.localeCompare(b.id))

export const categories: MealCategory[] = categoriesData as MealCategory[]