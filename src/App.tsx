import { useEffect, useState } from 'react'
import {
  Check,
  ClipboardList,
  Eye,
  EyeOff,
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
import { categories, recipes, type MealCategory, type Recipe, type RecipeOrigin } from './data/recipes'

type CategoryFilter = 'All' | MealCategory
type OriginFilter = 'All' | RecipeOrigin
type ReviewStatus = 'liked' | 'disliked' | null
type ReviewFilter = 'All' | 'Liked' | 'Disliked' | 'Unreviewed'
type RecipeState = { review: ReviewStatus; hidden: boolean }
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
}

// Maps this app's simple tri-state review onto the richer recipe_status.status
// enum in Supabase (never_again/dislike/neutral/like/love) — only like/dislike/
// neutral are used today; love/never_again are reserved for a future UI upgrade.
type DbReaction = 'never_again' | 'dislike' | 'neutral' | 'like' | 'love'
type RecipeStatusRow = { recipe_id: string; status: DbReaction; hidden: boolean }

const DEFAULT_STATE: RecipeState = { review: null, hidden: false }

function reactionToReview(status: DbReaction): ReviewStatus {
  if (status === 'like' || status === 'love') return 'liked'
  if (status === 'dislike' || status === 'never_again') return 'disliked'
  return null
}

function reviewToReaction(review: ReviewStatus): DbReaction {
  if (review === 'liked') return 'like'
  if (review === 'disliked') return 'dislike'
  return 'neutral'
}

function rowsToStateMap(rows: RecipeStatusRow[]): RecipeStateMap {
  const map: RecipeStateMap = {}
  for (const row of rows) {
    map[row.recipe_id] = { review: reactionToReview(row.status), hidden: row.hidden }
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
  const [showHidden, setShowHidden] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [servingsSelection, setServingsSelection] = useState(1)
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
      .select('recipe_id, status, hidden')
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
            [row.recipe_id]: { review: reactionToReview(row.status), hidden: row.hidden },
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

  const writeRecipeStatus = (id: string, next: RecipeState) => {
    setRecipeState((prev) => ({ ...prev, [id]: next }))
    supabase
      .from('recipe_status')
      .upsert(
        { recipe_id: id, status: reviewToReaction(next.review), hidden: next.hidden, updated_at: new Date().toISOString() },
        { onConflict: 'recipe_id' }
      )
      .then(({ error }) => {
        if (error) console.error('Failed to save recipe_status', error)
      })
  }

  const toggleReview = (id: string, value: 'liked' | 'disliked') => {
    const current = getState(id)
    const nextReview = current.review === value ? null : value
    writeRecipeStatus(id, { ...current, review: nextReview })
  }

  const toggleHidden = (id: string) => {
    const current = getState(id)
    writeRecipeStatus(id, { ...current, hidden: !current.hidden })
  }

  const hiddenCount = recipes.filter((recipe) => getState(recipe.id).hidden).length
  const normalizedQuery = query.trim().toLowerCase()

  const visibleRecipes = recipes.filter((recipe) => {
    const state = getState(recipe.id)
    if (showHidden !== state.hidden) return false
    const matchesCategory = activeCategory === 'All' || recipe.categories.includes(activeCategory)
    const matchesOrigin = originFilter === 'All' || recipe.origin === originFilter
    const matchesReview =
      reviewFilter === 'All' ||
      (reviewFilter === 'Liked' && state.review === 'liked') ||
      (reviewFilter === 'Disliked' && state.review === 'disliked') ||
      (reviewFilter === 'Unreviewed' && state.review === null)
    const searchableText = [recipe.title, recipe.description, ...recipe.categories, ...recipe.tags]
      .join(' ')
      .toLowerCase()
    return (
      matchesCategory && matchesOrigin && matchesReview && (!normalizedQuery || searchableText.includes(normalizedQuery))
    )
  })
  const avgProtein = Math.round(recipes.reduce((sum, recipe) => sum + recipe.protein, 0) / recipes.length)

  useEffect(() => {
    if (!selectedRecipe) return
    setServingsSelection(selectedRecipe.servings ?? 1)
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
    setShowHidden(false)
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
          className={state.review === 'liked' ? 'active-like' : ''}
          aria-pressed={state.review === 'liked'}
          aria-label={t.likeRecipe}
          title={t.like}
          onClick={withStop(() => toggleReview(recipe.id, 'liked'))}
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          className={state.review === 'disliked' ? 'active-dislike' : ''}
          aria-pressed={state.review === 'disliked'}
          aria-label={t.dislikeRecipe}
          title={t.dislike}
          onClick={withStop(() => toggleReview(recipe.id, 'disliked'))}
        >
          <ThumbsDown size={16} />
        </button>
        <button
          type="button"
          className={state.hidden ? 'active-hide' : ''}
          aria-pressed={state.hidden}
          aria-label={state.hidden ? t.unhideRecipe : t.hideRecipe}
          title={state.hidden ? t.unhide : t.hide}
          onClick={withStop(() => toggleHidden(recipe.id))}
        >
          {state.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
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
          {(['All', 'Liked', 'Disliked', 'Unreviewed'] as ReviewFilter[]).map((filter) => (
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
                : filter === 'Liked'
                  ? t.reviewLiked
                  : filter === 'Disliked'
                    ? t.reviewDisliked
                    : t.reviewUnreviewed}
            </button>
          ))}
          <button
            type="button"
            className={`seg seg-hidden ${showHidden ? 'active' : ''}`}
            aria-pressed={showHidden}
            onClick={() => setShowHidden((value) => !value)}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />} {t.hidden} ({hiddenCount})
          </button>
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        {t.resultCount(visibleRecipes.length, recipes.length)}
      </p>

      {visibleRecipes.length ? (
        <div className="st-grid">
          {visibleRecipes.map((recipe) => (
            <div className="st-card" key={recipe.id}>
              {lang === 'fr' && recipe.language === 'en' && (
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
                  <strong>{recipe.title}</strong>
                  <span>{recipe.calories} {t.kcal} &middot; {recipe.protein}g {t.protein} &middot; {recipe.time} {t.min}</span>
                </div>
              </button>
              {renderTriageButtons(recipe, true)}
            </div>
          ))}
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

      {selectedRecipe && (
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
              {lang === 'fr' && selectedRecipe.language === 'en' && (
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
              <h2 id="modal-title">{selectedRecipe.title}</h2>
              <p>{selectedRecipe.description}</p>
            </div>
            {renderTriageButtons(selectedRecipe, false)}
            <div className="macro-row">
              <div className="macro-cell"><strong>{selectedRecipe.calories}</strong><span>{t.kcal}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.protein}g</strong><span>{t.protein}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.carbs}g</strong><span>{t.carbs}</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.time}</strong><span>{t.min}</span></div>
            </div>
            {selectedRecipe.notes && (
              <p className="coach-note"><strong>{t.coachNote}</strong> {selectedRecipe.notes}</p>
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
                {selectedRecipe.ingredients.map((ingredient) => (
                  <li key={ingredient}><span className="dot" />{ingredient}</li>
                ))}
              </ul>
            )}
            <div className="section-label">{t.method}</div>
            <ol className="method-list">
              {selectedRecipe.steps.map((step, index) => (
                <li key={step}><span className="step-num">{index + 1}</span>{step}</li>
              ))}
            </ol>
            <a className="source-link" href={selectedRecipe.source.url} target="_blank" rel="noreferrer">
              {selectedRecipe.source.label}
            </a>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
