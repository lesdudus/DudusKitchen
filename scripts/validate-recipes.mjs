import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const recipesDir = join(__dirname, '..', 'src', 'data', 'recipes-json')

const VALID_CATEGORIES = new Set(['Breakfast', 'Lunch', 'Snack', 'Dinner'])
const VALID_ORIGINS = new Set(['curated', 'mine'])
const VALID_LANGUAGES = new Set(['en', 'fr'])
const PORK_PATTERN = /\bpork\b|\bbacon\b|\bham\b/i
const REQUIRED_STRING_FIELDS = ['id', 'title', 'description', 'image']
const REQUIRED_ARRAY_FIELDS = ['categories', 'tags', 'ingredients', 'steps']

let errorCount = 0
const seenIds = new Set()

function fail(file, message) {
  errorCount += 1
  console.error(`✗ ${file}: ${message}`)
}

const files = readdirSync(recipesDir).filter((f) => f.endsWith('.json'))
if (files.length === 0) {
  console.error('No recipe JSON files found — aborting validation')
  process.exit(1)
}

for (const file of files) {
  const path = join(recipesDir, file)
  let recipe
  try {
    recipe = JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    fail(file, `invalid JSON (${err.message})`)
    continue
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof recipe[field] !== 'string' || recipe[field].length === 0) {
      fail(file, `missing or empty required string field "${field}"`)
    }
  }
  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(recipe[field]) || recipe[field].length === 0) {
      fail(file, `missing or empty required array field "${field}"`)
    }
  }
  if (`${recipe.id}.json` !== file) {
    fail(file, `filename does not match id "${recipe.id}"`)
  }
  if (seenIds.has(recipe.id)) {
    fail(file, `duplicate recipe id "${recipe.id}"`)
  }
  seenIds.add(recipe.id)

  if (!VALID_ORIGINS.has(recipe.origin)) {
    fail(file, `invalid origin "${recipe.origin}"`)
  }
  if (!VALID_LANGUAGES.has(recipe.language)) {
    fail(file, `invalid or missing language "${recipe.language}"`)
  }
  if (Array.isArray(recipe.categories)) {
    for (const category of recipe.categories) {
      if (!VALID_CATEGORIES.has(category)) fail(file, `invalid category "${category}"`)
    }
  }
  for (const field of ['time', 'calories']) {
    if (!Number.isInteger(recipe[field]) || recipe[field] < 0) {
      fail(file, `field "${field}" must be a non-negative integer`)
    }
  }
  for (const field of ['protein', 'carbs']) {
    if (typeof recipe[field] !== 'number' || recipe[field] < 0) {
      fail(file, `field "${field}" must be a non-negative number`)
    }
  }
  if (!recipe.source || typeof recipe.source.label !== 'string' || typeof recipe.source.url !== 'string') {
    fail(file, 'missing or malformed "source" object')
  }

  const haystack = [recipe.title, recipe.description, ...(recipe.ingredients ?? [])].join(' ')
  if (PORK_PATTERN.test(haystack) && !/turkey (?:bacon|ham|sausage)/i.test(haystack)) {
    fail(file, 'possible pork reference detected — verify manually')
  }
}

if (errorCount > 0) {
  console.error(`\n${errorCount} validation error(s) across ${files.length} recipe files.`)
  process.exit(1)
}

console.log(`✓ ${files.length} recipe files passed validation.`)
