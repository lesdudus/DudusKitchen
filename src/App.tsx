import { useEffect, useState } from 'react'
import {
  ClipboardList,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from 'lucide-react'
import './App.css'
import sharedStateData from './data/shared-state.json'
import { categories, recipes, type MealCategory, type Recipe, type RecipeOrigin } from './data/recipes'

type CategoryFilter = 'All' | MealCategory
type OriginFilter = 'All' | RecipeOrigin
type ReviewStatus = 'liked' | 'disliked' | null
type ReviewFilter = 'All' | 'Liked' | 'Disliked' | 'Unreviewed'
type RecipeState = { review: ReviewStatus; hidden: boolean; updatedAt?: string }
type RecipeStateMap = Record<string, RecipeState>

const STATE_KEY = 'duduskitchen-recipe-state'
const DEFAULT_STATE: RecipeState = { review: null, hidden: false }
const SHARED_STATE = sharedStateData as RecipeStateMap

// "Later wins": each entry carries updatedAt so merging shared (bundled) state
// with this browser's local edits doesn't let a stale side clobber a newer one.
function mergeStates(base: RecipeStateMap, overlay: RecipeStateMap): RecipeStateMap {
  const merged: RecipeStateMap = { ...base }
  for (const id of Object.keys(overlay)) {
    const baseEntry = base[id]
    const overlayEntry = overlay[id]
    if (!baseEntry || (overlayEntry.updatedAt ?? '') >= (baseEntry.updatedAt ?? '')) {
      merged[id] = overlayEntry
    }
  }
  return merged
}

function loadLocalState(): RecipeStateMap {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}') as RecipeStateMap
  } catch {
    return {}
  }
}

function loadRecipeState(): RecipeStateMap {
  return mergeStates(SHARED_STATE, loadLocalState())
}

function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const [originFilter, setOriginFilter] = useState<OriginFilter>('All')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('All')
  const [showHidden, setShowHidden] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [recipeState, setRecipeState] = useState<RecipeStateMap>(() => loadRecipeState())
  const [syncOpen, setSyncOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMessage, setImportMessage] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(recipeState))
  }, [recipeState])

  const getState = (id: string): RecipeState => recipeState[id] ?? DEFAULT_STATE

  const toggleReview = (id: string, value: 'liked' | 'disliked') => {
    setRecipeState((prev) => {
      const current = prev[id] ?? DEFAULT_STATE
      const nextReview = current.review === value ? null : value
      return { ...prev, [id]: { ...current, review: nextReview, updatedAt: new Date().toISOString() } }
    })
  }

  const toggleHidden = (id: string) => {
    setRecipeState((prev) => {
      const current = prev[id] ?? DEFAULT_STATE
      return { ...prev, [id]: { ...current, hidden: !current.hidden, updatedAt: new Date().toISOString() } }
    })
  }

  const exportCode = JSON.stringify(recipeState)

  const copyExportCode = async () => {
    try {
      await navigator.clipboard.writeText(exportCode)
      setImportMessage('Copied — send this code to sync your likes/hides.')
    } catch {
      setImportMessage('Could not copy automatically — select the text above and copy manually.')
    }
  }

  const applyImportCode = () => {
    try {
      const incoming = JSON.parse(importText) as RecipeStateMap
      if (typeof incoming !== 'object' || incoming === null || Array.isArray(incoming)) {
        throw new Error('not an object')
      }
      setRecipeState((prev) => mergeStates(prev, incoming))
      setImportText('')
      setImportMessage('Synced! The other person\'s likes/hides have been merged in.')
    } catch {
      setImportMessage('That code looks invalid — double check you pasted the whole thing.')
    }
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
          aria-label="Like recipe"
          title="Like"
          onClick={withStop(() => toggleReview(recipe.id, 'liked'))}
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          className={state.review === 'disliked' ? 'active-dislike' : ''}
          aria-pressed={state.review === 'disliked'}
          aria-label="Dislike recipe"
          title="Dislike"
          onClick={withStop(() => toggleReview(recipe.id, 'disliked'))}
        >
          <ThumbsDown size={16} />
        </button>
        <button
          type="button"
          className={state.hidden ? 'active-hide' : ''}
          aria-pressed={state.hidden}
          aria-label={state.hidden ? 'Unhide recipe' : 'Hide recipe'}
          title={state.hidden ? 'Unhide' : 'Hide'}
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
          <h1 className="big-title">Dudu's Kitchen</h1>
          <div className="title-actions">
            <button
              type="button"
              className="backlog-btn"
              aria-label="Sync likes/hides"
              title="Sync likes/hides"
              onClick={() => {
                setImportMessage(null)
                setSyncOpen(true)
              }}
            >
              <RefreshCw size={18} />
            </button>
            <a className="backlog-btn" href="./backlog.html" target="_blank" rel="noreferrer" aria-label="Backlog" title="Backlog">
              <ClipboardList size={18} />
            </a>
          </div>
        </div>
        <div className="search-row">
          <label className="search-pill">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search recipes</span>
            <input
              type="search"
              placeholder="Search recipes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" title="Clear search">
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
              title="All recipes"
              onClick={() => setOriginFilter('All')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={originFilter === 'curated'}
              className={originFilter === 'curated' ? 'active' : ''}
              title="AI-Sourced"
              aria-label="AI-Sourced"
              onClick={() => setOriginFilter('curated')}
            >
              <Globe size={14} />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={originFilter === 'mine'}
              className={originFilter === 'mine' ? 'active mine' : ''}
              title="My Own"
              aria-label="My Own"
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
              {category}
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
              {filter}
            </button>
          ))}
          <button
            type="button"
            className={`seg seg-hidden ${showHidden ? 'active' : ''}`}
            aria-pressed={showHidden}
            onClick={() => setShowHidden((value) => !value)}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />} Hidden ({hiddenCount})
          </button>
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        Showing {visibleRecipes.length} of {recipes.length} recipes
      </p>

      {visibleRecipes.length ? (
        <div className="st-grid">
          {visibleRecipes.map((recipe) => (
            <div className="st-card" key={recipe.id}>
              <span className={`origin-badge ${recipe.origin}`}>
                {recipe.origin === 'mine' ? 'My Own' : 'AI-Sourced'}
              </span>
              <button type="button" className="st-open" onClick={() => setSelectedRecipe(recipe)}>
                <img src={recipe.image} alt="" />
                <div className="st-body">
                  <strong>{recipe.title}</strong>
                  <span>{recipe.calories} kcal &middot; {recipe.protein}g protein &middot; {recipe.time} min</span>
                </div>
              </button>
              {renderTriageButtons(recipe, true)}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={26} aria-hidden="true" />
          <h3>No recipes found</h3>
          <p>Try another search, meal category, or review filter.</p>
          <button type="button" onClick={resetFilters}>Reset filters</button>
        </div>
      )}

      <footer>
        <span>Dudu's Kitchen</span>
        <span>{recipes.length} recipes &middot; {avgProtein}g avg protein</span>
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
              aria-label="Close recipe"
              autoFocus
            >
              <X size={18} />
            </button>
            <div className="modal-hero">
              <img src={selectedRecipe.image} alt="" />
              <span className={`origin-badge ${selectedRecipe.origin}`}>
                {selectedRecipe.origin === 'mine' ? 'My Own' : 'AI-Sourced'}
              </span>
            </div>
            <div className="modal-heading">
              <h2 id="modal-title">{selectedRecipe.title}</h2>
              <p>{selectedRecipe.description}</p>
            </div>
            {renderTriageButtons(selectedRecipe, false)}
            <div className="macro-row">
              <div className="macro-cell"><strong>{selectedRecipe.calories}</strong><span>kcal</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.protein}g</strong><span>protein</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.carbs}g</strong><span>carbs</span></div>
              <div className="macro-cell"><strong>{selectedRecipe.time}</strong><span>min</span></div>
            </div>
            {selectedRecipe.notes && (
              <p className="coach-note"><strong>Coach's note:</strong> {selectedRecipe.notes}</p>
            )}
            <div className="section-label">Ingredients</div>
            <ul className="ingredients-list">
              {selectedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient}><span className="dot" />{ingredient}</li>
              ))}
            </ul>
            <div className="section-label">Method</div>
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

      {syncOpen && (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSyncOpen(false)
          }}
        >
          <section className="modal-sheet sync-sheet" role="dialog" aria-modal="true" aria-labelledby="sync-title">
            <button
              type="button"
              className="modal-close"
              onClick={() => setSyncOpen(false)}
              aria-label="Close sync"
              autoFocus
            >
              <X size={18} />
            </button>
            <div className="modal-heading">
              <h2 id="sync-title">Sync likes &amp; hides</h2>
              <p>Copy your code and send it to sync with the other person's device — no account needed.</p>
            </div>
            <div className="section-label">1. Export your code</div>
            <div className="sync-export">
              <textarea readOnly value={exportCode} onFocus={(event) => event.target.select()} />
              <button type="button" onClick={copyExportCode}>Copy code</button>
            </div>
            <div className="section-label">2. Paste their code to sync</div>
            <div className="sync-import">
              <textarea
                placeholder="Paste the code they sent you"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
              />
              <button type="button" onClick={applyImportCode} disabled={!importText.trim()}>Apply code</button>
            </div>
            {importMessage && <p className="sync-message">{importMessage}</p>}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
