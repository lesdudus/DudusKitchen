import { useEffect, useState } from 'react'
import {
  Check,
  ClipboardList,
  FlaskConical,
  Globe,
  Languages,
  Search,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from 'lucide-react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import { getStrings, type UiLanguage } from './i18n'
import { categories, recipes, isCoffeeRecipe, type FoodRecipe, type MealCategory, type Recipe, type RecipeOrigin } from './data/recipes'

// Localization: an "en" recipe with a matching translations.fr entry displays
// that translation while browsing in French, instead of the untranslated badge.
// Coffee recipes have no bilingual layer — only food recipes use this.
function hasTranslation(recipe: FoodRecipe, lang: UiLanguage) {
  return recipe.language === lang || (lang === 'fr' && !!recipe.translations?.fr)
}

function getDisplayContent(recipe: FoodRecipe, lang: UiLanguage) {
  if (lang === 'fr' && recipe.language === 'en' && recipe.translations?.fr) {
    return recipe.translations.fr
  }
  return recipe
}

type CategoryFilter = 'All' | MealCategory
type OriginFilter = 'All' | RecipeOrigin
type ReviewStatus = 'unreviewed' | 'like' | 'to_test' | 'dislike'
type ReviewFilter = 'All' | 'Unreviewed' | 'Like' | 'ToTest' | 'Dislike'
type RecipeState = { status: ReviewStatus }
type RecipeStateMap = Record<string, RecipeState>

const LANG_KEY = 'duduskitchen-lang'

function loadLanguage(): UiLanguage {
  return localStorage.getItem(LANG_KEY) === 'fr' ? 'fr' : 'en'
}

const CATEGORY_LABELS: Record<MealCategory, { en: string; fr: string }> = {
  Breakfast: { en: 'Breakfast', fr: 'Petit-déj' },
  Lunch: { en: 'Lunch', fr: 'Déjeuner' },
  Snack: { en: 'Snack', fr: 'Collation' },
  Dinner: { en: 'Dinner', fr: 'Dîner' },
  Coffee: { en: 'Coffee', fr: 'Café' },
}

// Maps this app's review states onto the richer recipe_status.status enum in
// Supabase (never_again/dislike/neutral/like/love) — 'to_test' maps to 'neutral';
// 'unreviewed' has no row at all (deleted on reset); love/never_again reserved for later.
type DbReaction = 'never_again' | 'dislike' | 'neutral' | 'like' | 'love'
type RecipeStatusRow = { recipe_id: string; status: DbReaction }

const DEFAULT_STATE: RecipeState = { status: 'unreviewed' }

function dbToUiStatus(status: DbReaction): ReviewStatus {
  if (status === 'like' || status === 'love') return 'like'
  if (status === 'dislike' || status === 'never_again') return 'dislike'
  return 'to_test'
}

function uiToDbStatus(status: 'like' | 'to_test' | 'dislike'): DbReaction {
  if (status === 'like') return 'like'
  if (status === 'dislike') return 'dislike'
  return 'neutral'
}

function rowsToStateMap(rows: RecipeStatusRow[]): RecipeStateMap {
  const map: RecipeStateMap = {}
  for (const row of rows) {
    map[row.recipe_id] = { status: dbToUiStatus(row.status) }
  }
  return map
}

type TranslationStatus = 'pending' | 'done'
type TranslationRow = { recipe_id: string; status: TranslationStatus }
type TranslationMap = Record<string, TranslationStatus>

function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const [originFilter, setOriginFilter] = useState<OriginFilter>('All')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('All')
  const [query, setQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [servingsSelection, setServingsSelection] = useState(1)
  const [coffeeBeans, setCoffeeBeans] = useState(0)
  const [recipeState, setRecipeState] = useState<RecipeStateMap>({})
  const [translationRequests, setTranslationRequests] = useState<TranslationMap>({})
  const [lang, setLang] = useState<UiLanguage>(() => loadLanguage())
  const t = getStrings(lang)

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  useEffect(() => {
    let cancelled = false

    supabase
      .from('recipe_status')
      .select('recipe_id, status')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to load recipe_status', error)
          return
        }
        setRecipeState(rowsToStateMap((data ?? []) as RecipeStatusRow[]))
      })

    const channel = supabase
      .channel('recipe_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipe_status' },
        (payload) => {
          const row = (payload.new ?? payload.old) as RecipeStatusRow | undefined
          if (!row) return
          setRecipeState((prev) => ({
            ...prev,
            [row.recipe_id]: { status: dbToUiStatus(row.status) },
          }))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    supabase
      .from('translation_requests')
      .select('recipe_id, status')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to load translation_requests', error)
          return
        }
        const map: TranslationMap = {}
        for (const row of (data ?? []) as TranslationRow[]) map[row.recipe_id] = row.status
        setTranslationRequests(map)
      })

    const channel = supabase
      .channel('translation_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'translation_requests' },
        (payload) => {
          const row = (payload.new ?? payload.old) as TranslationRow | undefined
          if (!row) return
          setTranslationRequests((prev) => ({ ...prev, [row.recipe_id]: row.status }))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleTranslationRequest = (id: string) => {
    const current = translationRequests[id]
    if (current === 'done') return // already translated by the time this would show
    if (current === 'pending') {
      setTranslationRequests((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      supabase
        .from('translation_requests')
        .delete()
        .eq('recipe_id', id)
        .then(({ error }) => {
          if (error) console.error('Failed to cancel translation request', error)
        })
      return
    }
    setTranslationRequests((prev) => ({ ...prev, [id]: 'pending' }))
    supabase
      .from('translation_requests')
      .upsert({ recipe_id: id, status: 'pending' }, { onConflict: 'recipe_id', ignoreDuplicates: true })
      .then(({ error }) => {
        if (error) console.error('Failed to save translation request', error)
      })
  }

  const getState = (id: string): RecipeState => recipeState[id] ?? DEFAULT_STATE

  const setReviewStatus = (id: string, status: ReviewStatus) => {
    setRecipeState((prev) => ({ ...prev, [id]: { status } }))
    if (status === 'unreviewed') {
      supabase
        .from('recipe_status')
        .delete()
        .eq('recipe_id', id)
        .then(({ error }) => {
          if (error) console.error('Failed to reset recipe_status', error)
        })
      return
    }
    supabase
      .from('recipe_status')
      .upsert(
        { recipe_id: id, status: uiToDbStatus(status), updated_at: new Date().toISOString() },
        { onConflict: 'recipe_id' }
      )
      .then(({ error }) => {
        if (error) console.error('Failed to save recipe_status', error)
      })
  }

  const toggleReviewStatus = (id: string, value: 'like' | 'to_test' | 'dislike') => {
    const current = getState(id)
    setReviewStatus(id, current.status === value ? 'unreviewed' : value)
  }

  const normalizedQuery = query.trim().toLowerCase()

  const visibleRecipes = recipes.filter((recipe) => {
    const state = getState(recipe.id)
    const matchesCategory = activeCategory === 'All' || recipe.categories.includes(activeCategory)
    const matchesOrigin = originFilter === 'All' || recipe.origin === originFilter
    const matchesReview =
      reviewFilter === 'All' ||
      (reviewFilter === 'Unreviewed' && state.status === 'unreviewed') ||
      (reviewFilter === 'Like' && state.status === 'like') ||
      (reviewFilter === 'Dislike' && state.status === 'dislike') ||
      (reviewFilter === 'ToTest' && state.status === 'to_test')
    const searchableText = [recipe.title, recipe.description, ...recipe.categories, ...recipe.tags]
      .join(' ')
      .toLowerCase()
    return (
      matchesCategory && matchesOrigin && matchesReview && (!normalizedQuery || searchableText.includes(normalizedQuery))
    )
  })
  const foodRecipes = recipes.filter((recipe): recipe is FoodRecipe => !isCoffeeRecipe(recipe))
  const avgProtein = Math.round(foodRecipes.reduce((sum, recipe) => sum + recipe.protein, 0) / foodRecipes.length)

  useEffect(() => {
    if (!selectedRecipe) return
    if (isCoffeeRecipe(selectedRecipe)) {
      setCoffeeBeans(selectedRecipe.beansDefault)
    } else {
      setServingsSelection(selectedRecipe.servings ?? 1)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRecipe(null)
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedRecipe])

  const formatScaledQuantity = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

  const resetFilters = () => {
    setQuery('')
    setActiveCategory('All')
    setOriginFilter('All')
    setReviewFilter('All')
  }

  const renderTriageButtons = (recipe: Recipe, stopPropagation: boolean) => {
    const state = getState(recipe.id)
    const withStop = (handler: () => void) => (event: { stopPropagation: () => void }) => {
      if (stopPropagation) event.stopPropagation()
      handler()
    }
    return (
      <div className="triage-row">
        <button
          type="button"
          className={state.status === 'like' ? 'active-like' : ''}
          aria-pressed={state.status === 'like'}
          aria-label={t.likeRecipe}
          title={t.like}
          onClick={withStop(() => toggleReviewStatus(recipe.id, 'like'))}
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          className={state.status === 'to_test' ? 'active-test' : ''}
          aria-pressed={state.status === 'to_test'}
          aria-label={t.toTestRecipe}
          title={t.toTest}
          onClick={withStop(() => toggleReviewStatus(recipe.id, 'to_test'))}
        >
          <FlaskConical size={16} />
        </button>
        <button
          type="button"
          className={state.status === 'dislike' ? 'active-dislike' : ''}
          aria-pressed={state.status === 'dislike'}
          aria-label={t.dislikeRecipe}
          title={t.dislike}
          onClick={withStop(() => toggleReviewStatus(recipe.id, 'dislike'))}
        >
          <ThumbsDown size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="sticky-top">
        <div className="title-row">
          <h1 className="big-title">{t.title}</h1>
          <div className="title-actions">
            <button
              type="button"
              className="backlog-btn"
              aria-label={t.language}
              title={t.language}
              onClick={() => setLang((value) => (value === 'en' ? 'fr' : 'en'))}
            >
              <Languages size={18} />
              <span className="lang-code">{lang.toUpperCase()}</span>
            </button>
            <a className="backlog-btn" href="./backlog.html" target="_blank" rel="noreferrer" aria-label={t.backlog} title={t.backlog}>
              <ClipboardList size={18} />
            </a>
          </div>
        </div>
        <div className="search-row">
          <label className="search-pill">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">{t.searchPlaceholder}</span>
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label={t.clearSearch} title={t.clearSearch}>
                <X size={15} />
              </button>
            )}
          </label>
          <div className="source-toggle" role="tablist" aria-label="Filter recipes by source">
            <button
              type="button"
              role="tab"
              aria-selected={originFilter === 'All'}
              className={originFilter === 'All' ? 'active' : ''}
              title={t.sourceAll}
              onClick={() => setOriginFilter('All')}
            >
              {t.sourceAll}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={originFilter === 'curated'}
              className={originFilter === 'curated' ? 'active' : ''}
              title={t.sourceCurated}
              aria-label={t.sourceCurated}
              onClick={() => setOriginFilter('curated')}
            >
              <Globe size={14} />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={originFilter === 'mine'}
              className={originFilter === 'mine' ? 'active mine' : ''}
              title={t.sourceMine}
              aria-label={t.sourceMine}
              onClick={() => setOriginFilter('mine')}
            >
              <User size={14} />
            </button>
          </div>
        </div>
        <div className="seg-wrap" role="tablist" aria-label="Filter recipes by meal">
          {(['All', ...categories] as CategoryFilter[]).map((category) => (
            <button
              type="button"
              key={category}
              role="tab"
              aria-selected={activeCategory === category}
              className={`seg ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'All' ? t.categoryAll : CATEGORY_LABELS[category][lang]}
            </button>
          ))}
        </div>
        <div className="seg-wrap seg-wrap-secondary" role="tablist" aria-label="Filter recipes by review status">
          {(['All', 'Unreviewed', 'Like', 'ToTest', 'Dislike'] as ReviewFilter[]).map((filter) => (
            <button
              type="button"
              key={filter}
              role="tab"
              aria-selected={reviewFilter === filter}
              className={`seg ${reviewFilter === filter ? 'active' : ''}`}
              onClick={() => setReviewFilter(filter)}
            >
              {filter === 'All'
                ? t.reviewAll
                : filter === 'Unreviewed'
                  ? t.reviewUnreviewed
                  : filter === 'Like'
                    ? t.reviewLiked
                    : filter === 'ToTest'
                      ? t.reviewToTest
                      : t.reviewDisliked}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        {t.resultCount(visibleRecipes.length, recipes.length)}
      </p>

      {visibleRecipes.length ? (
        <div className="st-grid">
          {visibleRecipes.map((recipe) => {
            if (isCoffeeRecipe(recipe)) {
              return (
                <div className="st-card" key={recipe.id}>
                  <button type="button" className="st-open" onClick={() => setSelectedRecipe(recipe)}>
                    <img src={recipe.image} alt="" />
                    <div className="st-body">
                      <strong>{recipe.title}</strong>
                      <span>{recipe.beansDefault}g &middot; {recipe.waterDefault}g &middot; {t.grinderSetting} {recipe.grinder}</span>
                    </div>
                  </button>
                </div>
              )
            }
            const display = getDisplayContent(recipe, lang)
            return (
            <div className="st-card" key={recipe.id}>
              {!hasTranslation(recipe, lang) && (
                <button
                  type="button"
                  className={`lang-dot ${translationRequests[recipe.id] ? 'requested' : ''}`}
                  title={translationRequests[recipe.id] ? t.translateRequestedHint : `${t.notTranslatedBadge} — ${t.translateThis}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleTranslationRequest(recipe.id)
                  }}
                >
                  {translationRequests[recipe.id] ? <Check size={12} /> : 'EN'}
                </button>
              )}
              <button type="button" className="st-open" onClick={() => setSelectedRecipe(recipe)}>
                <img src={recipe.image} alt="" />
                <div className="st-body">
                  <strong>{display.title}</strong>
                  <span>{recipe.calories} {t.kcal} &middot; {recipe.protein}g {t.protein} &middot; {recipe.time} {t.min}</span>
                </div>
              </button>
              {renderTriageButtons(recipe, true)}
            </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={26} aria-hidden="true" />
          <h3>{t.emptyTitle}</h3>
          <p>{t.emptyBody}</p>
          <button type="button" onClick={resetFilters}>{t.resetFilters}</button>
        </div>
      )}

      <footer>
        <span>{t.title}</span>
        <span>{t.footerRecipeCount(recipes.length, avgProtein)}</span>
      </footer>

      {selectedRecipe && isCoffeeRecipe(selectedRecipe) && (() => {
        const recipe = selectedRecipe
        const ratio = recipe.waterDefault / recipe.beansDefault
        const water = coffeeBeans * ratio
        const preInfusion = water * (recipe.preInfusionPercent / 100)
        return (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRecipe(null)
          }}
        >
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label={t.closeRecipe}
              autoFocus
            >
              <X size={18} />
            </button>
            <div className="modal-hero">
              <img src={recipe.image} alt="" />
            </div>
            <div className="modal-heading">
              <h2 id="modal-title">{recipe.title}</h2>
              <p>{recipe.description}</p>
            </div>
            <label className="servings-row">
              {t.coffeeDose}
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={coffeeBeans}
                onChange={(event) => setCoffeeBeans(event.target.value === '' ? 0 : Number(event.target.value))}
              />
            </label>
            <div className="macro-row">
              <div className="macro-cell"><strong>{water.toFixed(1)}g</strong><span>{t.coffeeWater}</span></div>
              <div className="macro-cell"><strong>{preInfusion.toFixed(1)}g</strong><span>{t.coffeePreInfusion}</span></div>
              <div className="macro-cell"><strong>{recipe.grinder}</strong><span>{t.grinderSetting}</span></div>
            </div>
            {recipe.notes && (
              <p className="coach-note"><strong>{t.coachNote}</strong> {recipe.notes}</p>
            )}
            <div className="section-label">{t.method}</div>
            <ol className="method-list">
              {recipe.steps.map((step, index) => (
                <li key={step}><span className="step-num">{index + 1}</span>{step}</li>
              ))}
            </ol>
            <a className="source-link" href={recipe.source.url} target="_blank" rel="noreferrer">
              {recipe.source.label}
            </a>
          </section>
        </div>
        )
      })()}

      {selectedRecipe && !isCoffeeRecipe(selectedRecipe) && (() => {
        const selectedDisplay = getDisplayContent(selectedRecipe, lang)
        return (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRecipe(null)
          }}
        >
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label={t.closeRecipe}
              autoFocus
            >
              <X size={18} />
            </button>
            <div className="modal-hero">
              <img src={selectedRecipe.image} alt="" />
              {!hasTranslation(selectedRecipe, lang) && (
                <button
                  type="button"
                  className={`lang-dot modal-lang-dot ${translationRequests[selectedRecipe.id] ? 'requested' : ''}`}
                  title={translationRequests[selectedRecipe.id] ? t.translateRequestedHint : `${t.notTranslatedBadge} — ${t.translateThis}`}
                  onClick={() => toggleTranslationRequest(selectedRecipe.id)}
                >
                  {translationRequests[selectedRecipe.id] ? <Check size={14} /> : 'EN'}
                </button>
              )}
            </div>
            <div className="modal-heading">
              <h2 id="modal-title">{selectedDisplay.title}</h2>
              <p>{selectedDisplay.description}</p>
            </div>
            {renderTriageButtons(selectedRecipe, false)}
            <div className="macro-row">
              <div className="macro-cell"><strong>{selectedRecipe.calories}</strong><span>{t.kcal}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.protein}g</strong><span>{t.protein}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.carbs}g</strong><span>{t.carbs}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.time}</strong><span>{t.min}</span></div>
            </div>
            {selectedDisplay.notes && (
              <p className="coach-note"><strong>{t.coachNote}</strong> {selectedDisplay.notes}</p>
            )}
            <div className="section-label">{t.ingredients}</div>
            {selectedRecipe.servings && selectedRecipe.scalableIngredients ? (
              <>
                <label className="servings-row">
                  {t.servingsLabel}
                  <select
                    value={servingsSelection}
                    onChange={(event) => setServingsSelection(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <ul className="ingredients-list">
                  {selectedRecipe.scalableIngredients.map((item) => {
                    const scaled = (item.quantity * servingsSelection) / selectedRecipe.servings!
                    return (
                      <li key={item.name}>
                        <span className="dot" />
                        {formatScaledQuantity(scaled)} {item.unit} {item.name}
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <ul className="ingredients-list">
                {selectedDisplay.ingredients.map((ingredient) => (
                  <li key={ingredient}><span className="dot" />{ingredient}</li>
                ))}
              </ul>
            )}
            <div className="section-label">{t.method}</div>
            <ol className="method-list">
              {selectedDisplay.steps.map((step, index) => (
                <li key={step}><span className="step-num">{index + 1}</span>{step}</li>
              ))}
            </ol>
            <a className="source-link" href={selectedRecipe.source.url} target="_blank" rel="noreferrer">
              {selectedRecipe.source.label}
            </a>
          </section>
        </div>
        )
      })()}
    </div>
  )
}

export default App
