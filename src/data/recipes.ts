import categoriesData from './categories.json'

export type MealCategory = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' | 'Coffee'
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

type RecipeBase = {
  id: string
  categories: MealCategory[]
  origin: RecipeOrigin
  language: RecipeLanguage
  title: string
  description: string
  image: string
  tags: string[]
  source: { label: string; url: string }
  /** Short coach's tip — why this recipe works, or how/when to use it. */
  notes?: string
}

export type FoodRecipe = RecipeBase & {
  time: number
  calories: number
  protein: number
  carbs: number
  ingredients: string[]
  steps: string[]
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

// Coffee brewing recipes use a distinct template: a bean-weight input drives a
// live-calculated water amount (via the ratio implied by beansDefault/waterDefault)
// and a pre-infusion volume (preInfusionPercent of that water). Every coffee
// recipe defines its own numbers — there is no universal formula across recipes.
export type CoffeeRecipe = RecipeBase & {
  beansDefault: number
  waterDefault: number
  preInfusionPercent: number
  grinder: string
  steps: string[]
}

export type Recipe = FoodRecipe | CoffeeRecipe

export function isCoffeeRecipe(recipe: Recipe): recipe is CoffeeRecipe {
  return 'beansDefault' in recipe
}

// Each recipe lives in its own JSON file under ./recipes-json — one file per
// recipe keeps AI-agent edits and PR diffs isolated to the recipe being changed.
const recipeModules = import.meta.glob<Recipe>('./recipes-json/*.json', {
  eager: true,
  import: 'default',
})

export const recipes: Recipe[] = Object.values(recipeModules).sort((a, b) => a.id.localeCompare(b.id))

export const categories: MealCategory[] = categoriesData as MealCategory[]
