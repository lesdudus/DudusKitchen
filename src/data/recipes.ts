import categoriesData from './categories.json'

export type MealCategory = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'
export type RecipeOrigin = 'curated' | 'mine'
export type RecipeLanguage = 'en' | 'fr'

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
}

// Each recipe lives in its own JSON file under ./recipes-json — one file per
// recipe keeps AI-agent edits and PR diffs isolated to the recipe being changed.
const recipeModules = import.meta.glob<Recipe>('./recipes-json/*.json', {
  eager: true,
  import: 'default',
})

export const recipes: Recipe[] = Object.values(recipeModules).sort((a, b) => a.id.localeCompare(b.id))

export const categories: MealCategory[] = categoriesData as MealCategory[]