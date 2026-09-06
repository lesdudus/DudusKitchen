// Generates 40 static HTML files (20 concepts x home+recipe) for a SEPARATE, efficiency-first
// exploration of Dudu's Kitchen: personal daily-use tool, mobile-first, no marketing theatrics.
// 10 concepts = black/red palettes, 10 = other palettes. All share one of 8 mobile-native UI
// paradigms inspired by real apps (Apple Settings/Health, Airbnb, Spotify, Uber Eats, Todoist,
// Kindle, App Store Today). System fonts only (no webfont download) for speed.
// Kept fully separate from design-review/visions/ (the earlier marketing-style exploration).
// Run with: node generate-efficient.mjs
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'efficient')
mkdirSync(OUT_DIR, { recursive: true })
readdirSync(OUT_DIR).forEach((f) => { if (/^concept-\d{2}-(home|recipe)\.html$/.test(f)) unlinkSync(join(OUT_DIR, f)) })

// ---------- real product data (matches DudusKitchen/src/data/recipes.ts) ----------
const CATEGORIES = ['Breakfast', 'Lunch', 'Snack', 'Dinner']
const RECIPES = [
  { id: 'berry-protein-overnight-oats', category: 'Breakfast', title: 'Berry Protein Overnight Oats', description: 'Creamy oats with skyr, berries, chia and vanilla protein for a fast post-workout breakfast.', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80', time: 10, calories: 390, protein: 33, carbs: 48, tags: ['Meal prep', 'No cook'], ingredients: ['50 g rolled oats', '170 g plain skyr', '100 ml semi-skimmed milk', '20 g vanilla protein powder', '80 g mixed berries', '8 g chia seeds', 'Cinnamon to taste'], steps: ['Stir the oats, skyr, milk, protein powder, chia and cinnamon until smooth.', 'Cover and chill overnight, then loosen with a splash of milk if needed.', 'Finish with the berries just before eating.'] },
  { id: 'cinnamon-banana-protein-pancakes', category: 'Breakfast', title: 'Cinnamon Banana Protein Pancakes', description: 'Blended oat pancakes with banana, eggs and whey, served with cool yogurt and berries.', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', time: 20, calories: 410, protein: 35, carbs: 42, tags: ['Post-workout', 'Oats'] },
  { id: 'spicy-cajun-chicken-rice', category: 'Lunch', title: 'Spicy Cajun Chicken & Rice Bowl', description: 'Smoky chicken breast, basmati rice and charred peppers with a bright lime yogurt drizzle.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', time: 30, calories: 495, protein: 48, carbs: 55, tags: ['Spicy', 'Meal prep'] },
  { id: 'chicken-satay-crunch-bowl', category: 'Lunch', title: 'Chicken Satay Crunch Bowl', description: 'Ginger chicken, crisp vegetables and rice with a lighter chilli-peanut dressing.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', time: 25, calories: 470, protein: 46, carbs: 44, tags: ['Crunchy', 'Chilli'] },
  { id: 'chocolate-oat-protein-bites', category: 'Snack', title: 'Chocolate Oat Protein Bites', description: 'No-bake cocoa oat bites with whey and peanut butter for a portable training-day snack.', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', time: 15, calories: 210, protein: 17, carbs: 22, tags: ['No bake', 'Portable'] },
  { id: 'berry-skyr-cheesecake-cups', category: 'Snack', title: 'Berry Skyr Cheesecake Cups', description: 'A light cheesecake-style cup with skyr, soft cheese, berries and a crisp oat base.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', time: 15, calories: 225, protein: 21, carbs: 25, tags: ['Cheesecake', 'No bake'] },
  { id: 'chicken-karahi-rice', category: 'Dinner', title: 'Chicken Karahi with Basmati Rice', description: 'A punchy tomato, ginger and green chilli chicken skillet with a measured serving of rice.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', time: 40, calories: 520, protein: 52, carbs: 53, tags: ['Hot', 'One pan'] },
  { id: 'lighter-chicken-biryani', category: 'Dinner', title: 'Lighter Chicken Biryani', description: 'Fragrant chicken and rice layered with warm spices, peas, herbs and cooling yogurt.', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80', time: 45, calories: 535, protein: 45, carbs: 62, tags: ['Spiced', 'Batch cook'] },
]
const FEATURED_RECIPE = RECIPES[0]
const AVG_PROTEIN = Math.round(RECIPES.reduce((sum, r) => sum + r.protein, 0) / RECIPES.length)

// ---------- 8 mobile-native, efficiency-first UI paradigms (reused round-robin across 20 concepts) ----------
const PARADIGMS = ['grouped-list', 'feed-cards', 'dark-grid', 'chips-feed', 'dashboard', 'checklist', 'shelf-grid', 'segmented-tabs']
const PARADIGM_REF = {
  'grouped-list': 'Apple Settings / Reminders',
  'feed-cards': 'Airbnb / Google Discover',
  'dark-grid': 'Spotify / Apple Music',
  'chips-feed': 'Uber Eats / DoorDash',
  dashboard: 'Apple Health / Robinhood',
  checklist: 'Todoist / Bear',
  'shelf-grid': 'Kindle / Apple TV',
  'segmented-tabs': 'App Store Today',
}

const CONCEPTS = [
  // ---- 10 black/red ----
  { id: 'settings-noir', name: 'Settings Noir', mode: 'dark', bg: '#101010', text: '#F2ECE4', accent: '#E0293D', accentFg: '#FFFFFF' },
  { id: 'rooftop-feed', name: 'Rooftop Feed', mode: 'dark', bg: '#0B0B0C', text: '#F3EEE7', accent: '#FF3B4E', accentFg: '#FFFFFF' },
  { id: 'vinyl-noir-grid', name: 'Vinyl Noir Grid', mode: 'dark', bg: '#121212', text: '#F1F1F1', accent: '#E8112D', accentFg: '#FFFFFF' },
  { id: 'market-chips-rouge', name: 'Market Chips Rouge', mode: 'dark', bg: '#0E0E0F', text: '#F1EEE9', accent: '#FF453A', accentFg: '#FFFFFF' },
  { id: 'vitals-noir', name: 'Vitals Noir', mode: 'dark', bg: '#131313', text: '#F2EFEA', accent: '#FF375F', accentFg: '#FFFFFF' },
  { id: 'do-noir', name: 'Do Noir', mode: 'dark', bg: '#0A0A0A', text: '#EDEAE4', accent: '#FF6961', accentFg: '#14100D' },
  { id: 'library-noir-shelves', name: 'Library Noir Shelves', mode: 'dark', bg: '#111111', text: '#F0EBE2', accent: '#D7263D', accentFg: '#FFFFFF' },
  { id: 'today-noir-tabs', name: 'Today Noir Tabs', mode: 'dark', bg: '#101012', text: '#F2EFEA', accent: '#E63946', accentFg: '#FFFFFF' },
  { id: 'crimson-paper-settings', name: 'Crimson Paper Settings', mode: 'light', bg: '#F6EEEA', text: '#1A1A1A', accent: '#B3001B', accentFg: '#FFFFFF' },
  { id: 'coral-feed-noir', name: 'Coral Feed Noir', mode: 'dark', bg: '#0D0D0D', text: '#F1ECE6', accent: '#FF5A5F', accentFg: '#FFFFFF' },
  // ---- 10 other palettes ----
  { id: 'ocean-settings', name: 'Ocean Settings', mode: 'light', bg: '#F5F8FA', text: '#14213D', accent: '#2D6CDF', accentFg: '#FFFFFF' },
  { id: 'discover-feed-sage', name: 'Discover Feed Sage', mode: 'light', bg: '#F3F6F1', text: '#213821', accent: '#4C8C4A', accentFg: '#FFFFFF' },
  { id: 'amethyst-grid', name: 'Amethyst Grid', mode: 'dark', bg: '#17131F', text: '#EFEAF7', accent: '#8B5CF6', accentFg: '#FFFFFF' },
  { id: 'citrus-chips', name: 'Citrus Chips', mode: 'light', bg: '#FFFDF7', text: '#2A2016', accent: '#FF8A3D', accentFg: '#FFFFFF' },
  { id: 'health-rings-teal', name: 'Health Rings Teal', mode: 'dark', bg: '#0E1B1B', text: '#E6F5F3', accent: '#2DD4BF', accentFg: '#08211F' },
  { id: 'clarity-checklist', name: 'Clarity Checklist', mode: 'light', bg: '#FAFAF8', text: '#22252A', accent: '#3A86FF', accentFg: '#FFFFFF' },
  { id: 'reading-shelf-amber', name: 'Reading Shelf Amber', mode: 'light', bg: '#FBF3E7', text: '#2E2416', accent: '#C08A2E', accentFg: '#FFFFFF' },
  { id: 'today-tabs-indigo', name: 'Today Tabs Indigo', mode: 'dark', bg: '#12131C', text: '#EEEFF9', accent: '#5B6CFF', accentFg: '#FFFFFF' },
  { id: 'meadow-settings', name: 'Meadow Settings', mode: 'light', bg: '#F4F8F2', text: '#20291F', accent: '#588157', accentFg: '#FFFFFF' },
  { id: 'sunrise-feed-coral', name: 'Sunrise Feed Coral', mode: 'light', bg: '#FFF7F0', text: '#2E2015', accent: '#FF7A59', accentFg: '#FFFFFF' },
]
CONCEPTS.forEach((c, i) => {
  c.order = i + 1
  c.group = i < 10 ? 'black-red' : 'color'
  c.paradigm = PARADIGMS[(i % 10) % PARADIGMS.length]
  c.blurb = 'Efficient, mobile-first ' + c.paradigm.replace('-', ' ') + ' pattern, inspired by ' + PARADIGM_REF[c.paradigm] + '.'
})

function esc(str) { return String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) }
function pad(n) { return String(n).padStart(2, '0') }
function fileHome(c) { return 'concept-' + pad(c.order) + '-home.html' }
function fileRecipe(c) { return 'concept-' + pad(c.order) + '-recipe.html' }

// Desktop reading/browsing width per paradigm — grid paradigms grow wide to use the extra
// space (more columns), plain-reading paradigms stay narrower for comfortable line length.
const DESKTOP_MAX = { 'grouped-list': '760px', 'feed-cards': '1100px', 'dark-grid': '1100px', 'chips-feed': '900px', dashboard: '760px', checklist: '640px', 'shelf-grid': '900px', 'segmented-tabs': '900px' }

function themeVars(c) {
  const { bg, text, accent, accentFg } = c
  const shared = { '--accent': accent, '--accent-fg': accentFg, '--accent-soft': 'color-mix(in srgb, ' + accent + ' 16%, transparent)', '--desktop-max': DESKTOP_MAX[c.paradigm] || '640px' }
  const vars = c.mode === 'dark'
    ? { '--bg': bg, '--surface': 'color-mix(in srgb, ' + bg + ' 82%, white 18%)', '--surface-2': 'color-mix(in srgb, ' + bg + ' 90%, white 10%)', '--border': 'color-mix(in srgb, ' + text + ' 14%, transparent)', '--text': text, '--muted': 'color-mix(in srgb, ' + text + ' 60%, ' + bg + ' 40%)' }
    : { '--bg': bg, '--surface': 'color-mix(in srgb, white 92%, ' + bg + ' 8%)', '--surface-2': '#FFFFFF', '--border': 'color-mix(in srgb, ' + text + ' 12%, transparent)', '--text': text, '--muted': 'color-mix(in srgb, ' + text + ' 62%, white 38%)' }
  return ':root{' + Object.entries({ ...vars, ...shared }).map(([k, v]) => k + ':' + v).join(';') + '}'
}

const BASE_CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{background:var(--bg)}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;margin:0 auto;max-width:480px;min-height:100vh;-webkit-font-smoothing:antialiased;padding-bottom:calc(24px + env(safe-area-inset-bottom));transition:max-width .15s ease}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{cursor:pointer;font:inherit;-webkit-tap-highlight-color:transparent}
h1,h2,h3,h4{margin:0}
@media (min-width:700px){body{max-width:var(--desktop-max,480px)}}
.sticky-top{position:sticky;top:0;z-index:5;background:var(--bg)}
.big-title{font-size:2rem;font-weight:800;letter-spacing:-.02em;padding:8px 20px 4px}
.search-pill{margin:6px 20px 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;height:38px;display:flex;align-items:center;padding:0 12px;color:var(--muted);font-size:.9rem}
.chip-row{display:flex;gap:8px;overflow-x:auto;padding:0 20px 14px}
.chip{flex:0 0 auto;background:var(--surface);border:1px solid var(--border);color:var(--muted);font-size:.82rem;font-weight:600;padding:8px 14px;border-radius:999px;white-space:nowrap}
.chip.active{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
.macro-row{display:flex;gap:8px;padding:14px 20px}
.macro-cell{flex:1;background:var(--surface);border-radius:12px;padding:10px 6px;text-align:center}
.macro-cell strong{display:block;font-size:1.05rem}
.macro-cell span{font-size:.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.section-label{padding:18px 20px 8px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.plain-list{padding:0 20px}
.plain-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);min-height:44px}
.plain-row:last-child{border-bottom:0}
.ingredients-list,.method-list{margin:0;padding:0 20px 4px;list-style:none}
.ingredients-list li,.method-list li{padding:10px 0;border-bottom:1px solid var(--border);font-size:.92rem;color:var(--muted);display:flex;gap:10px}
.ingredients-list li:last-child,.method-list li:last-child{border-bottom:0}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:0 0 auto;margin-top:7px}
.step-num{flex:0 0 auto;width:20px;height:20px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:.7rem;font-weight:700;display:flex;align-items:center;justify-content:center}
.action-bar{position:sticky;bottom:0;display:flex;gap:10px;padding:14px 20px calc(14px + env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--border)}
.btn{flex:1;height:46px;border-radius:12px;border:1px solid var(--accent);color:var(--accent);background:transparent;font-weight:700;font-size:.9rem}
.btn.primary{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
.back-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px}
.back-row a{font-size:.9rem;color:var(--accent);font-weight:600}
.review-bar{position:fixed;bottom:14px;left:14px;z-index:999;background:rgba(20,18,14,.9);color:#efe9df;font:600 11px/1 -apple-system,sans-serif;padding:8px 12px;border-radius:8px;text-decoration:none;border:1px solid rgba(255,255,255,.14)}
.review-bar-home{bottom:52px}
.about-panel{position:fixed;bottom:14px;right:14px;z-index:999;max-width:260px;background:rgba(20,18,14,.92);color:#efe9df;font:12px/1.5 -apple-system,sans-serif;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14)}
.about-panel summary{cursor:pointer;font-weight:700;list-style:none}
.about-panel summary::-webkit-details-marker{display:none}
.about-panel summary::before{content:"+ "}
.about-panel[open] summary::before{content:"\\2212 "}
.about-panel p{margin:8px 0 0;color:#cfc7ba}
`

function reviewBar(c, homeHref) {
  const backHome = homeHref ? '<a class="review-bar review-bar-home" href="' + homeHref + '">&larr; Back to ' + esc(c.name) + ' home</a>' : ''
  return backHome + '<a class="review-bar" href="../efficient-index.html">&larr; Back to gallery &middot; Concept ' + pad(c.order) + '/20 &middot; ' + esc(c.name) + ' &middot; ' + c.paradigm + '</a>'
}
function aboutPanel(c) { return '<details class="about-panel"><summary>About this concept</summary><p>' + esc(c.blurb) + '</p></details>' }
function page(c, extraCss, bodyInner, homeHref) {
  return '<!doctype html>\n<html lang="en" data-paradigm="' + c.paradigm + '">\n<head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n<title>' + esc(c.name) + " — Dudu's Kitchen</title>\n<style>\n" + themeVars(c) + '\n' + BASE_CSS + '\n' + extraCss + '\n</style>\n</head>\n<body>\n' + bodyInner + '\n' + reviewBar(c, homeHref) + '\n' + aboutPanel(c) + '\n</body>\n</html>'
}
function macroCells(r) {
  return '<div class="macro-row"><div class="macro-cell"><strong>' + r.calories + '</strong><span>kcal</span></div><div class="macro-cell"><strong>' + r.protein + 'g</strong><span>protein</span></div><div class="macro-cell"><strong>' + r.carbs + 'g</strong><span>carbs</span></div><div class="macro-cell"><strong>' + r.time + '</strong><span>min</span></div></div>'
}
function ingredientsMethod(r) {
  return '<div class="section-label">Ingredients</div><ul class="ingredients-list">' + r.ingredients.map((i) => '<li><span class="dot"></span>' + esc(i) + '</li>').join('') + '</ul>' +
    '<div class="section-label">Method</div><ol class="method-list" style="padding-left:20px">' + r.steps.map((s, i) => '<li style="list-style:none"><span class="step-num">' + (i + 1) + '</span>' + esc(s) + '</li>').join('') + '</ol>'
}
function actionBar() { return '<div class="action-bar"><button class="btn primary">&#9825; Save</button><button class="btn">Share</button></div>' }
function chipFilterScript() {
  return `<script>
document.querySelectorAll('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach((el) => { el.style.display = (f === 'All' || el.dataset.cat === f) ? '' : 'none'; });
  });
});
</script>`
}

// ============================================================
// P1 — GROUPED LIST (Apple Settings / Reminders)
// ============================================================
function groupedListHome(c) {
  const groups = CATEGORIES.map((cat) => {
    const rows = RECIPES.filter((r) => r.category === cat).map((r) => '<a class="gl-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '"><img src="' + r.image + '" alt=""><div class="gl-text"><strong>' + esc(r.title) + '</strong><span>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein</span></div><span class="gl-chevron">&rsaquo;</span></a>').join('')
    return '<section class="gl-block"><div class="section-label">' + cat + '</div><div class="gl-group">' + rows + '</div></section>'
  }).join('')
  const css = `
.gl-sections{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:0 20px;padding:0 20px}
.gl-group{background:var(--surface);border-radius:14px;overflow:hidden;margin-bottom:8px}
.gl-row{display:flex;align-items:center;gap:12px;padding:10px 14px;min-height:64px;border-bottom:1px solid var(--border)}
.gl-row:last-child{border-bottom:0}
.gl-row img{width:44px;height:44px;border-radius:10px;object-fit:cover;flex:0 0 auto}
.gl-text{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.gl-text strong{font-size:.94rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gl-text span{font-size:.74rem;color:var(--muted)}
.gl-chevron{color:var(--muted);opacity:.5;font-size:1.2rem}
.gl-block .section-label{padding-left:0;padding-right:0}
`
  const body = '<div class="sticky-top"><h1 class="big-title">Recipes</h1><div class="search-pill">&#128269; Search recipes</div></div><div class="gl-sections">' + groups + '</div>'
  return page(c, css, body)
}
function groupedListRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.gl-hero{display:flex;gap:12px;align-items:center;padding:4px 20px 14px}.gl-hero img{width:64px;height:64px;border-radius:14px;object-fit:cover}.gl-hero h1{font-size:1.2rem}.gl-hero p{margin:4px 0 0;font-size:.8rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Recipes</a></div></div><div class="gl-hero"><img src="' + r.image + '" alt=""><div><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div></div>' + macroCells(r) + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P2 — FEED CARDS (Airbnb / Google Discover)
// ============================================================
function feedCardsHome(c) {
  const chips = ['All', ...CATEGORIES].map((cat, i) => '<button class="chip ' + (i === 0 ? 'active' : '') + '" data-filter="' + cat + '">' + cat + '</button>').join('')
  const cards = RECIPES.map((r) => '<a class="fc-card" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '" data-cat="' + r.category + '"><div class="fc-imgwrap"><img src="' + r.image + '" alt=""><span class="fc-heart">&#9825;</span></div><div class="fc-body"><strong>' + esc(r.title) + '</strong><p>' + esc(r.description) + '</p><span class="fc-meta">' + r.category + ' &middot; ' + r.calories + ' kcal &middot; ' + r.time + ' min</span></div></a>').join('')
  const css = `
.fc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;padding:0 20px 20px}
.fc-card{display:block;border-radius:16px;overflow:hidden;background:var(--surface)}
.fc-imgwrap{position:relative;aspect-ratio:4/3}
.fc-imgwrap img{width:100%;height:100%;object-fit:cover}
.fc-heart{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.35);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.fc-body{padding:12px 14px}
.fc-body strong{font-size:1rem}
.fc-body p{margin:4px 0 6px;font-size:.82rem;color:var(--muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.fc-meta{font-size:.74rem;color:var(--muted)}
`
  const body = '<div class="sticky-top"><h1 class="big-title">Discover</h1><div class="chip-row">' + chips + '</div></div><div class="fc-grid">' + cards + '</div>' + chipFilterScript()
  return page(c, css, body)
}
function feedCardsRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.fc-hero{margin:0 20px;border-radius:16px;overflow:hidden;aspect-ratio:4/3}.fc-hero img{width:100%;height:100%;object-fit:cover}.fc-heading{padding:14px 20px 0}.fc-heading h1{font-size:1.3rem}.fc-heading p{margin:6px 0 0;font-size:.85rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Discover</a></div></div><div class="fc-hero"><img src="' + r.image + '" alt=""></div><div class="fc-heading"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div>' + macroCells(r) + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P3 — DARK GRID (Spotify / Apple Music)
// ============================================================
function darkGridHome(c) {
  const chips = ['All', ...CATEGORIES].map((cat, i) => '<button class="chip ' + (i === 0 ? 'active' : '') + '" data-filter="' + cat + '">' + cat + '</button>').join('')
  const tiles = RECIPES.map((r) => '<a class="dg-tile" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><strong>' + esc(r.title) + '</strong><span>' + r.calories + ' kcal &middot; ' + r.protein + 'g</span></a>').join('')
  const css = `
.dg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;padding:4px 20px 20px}
.dg-tile{display:flex;flex-direction:column;gap:6px}
.dg-tile img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px}
.dg-tile strong{font-size:.86rem;line-height:1.2}
.dg-tile span{font-size:.68rem;color:var(--muted)}
`
  const body = '<div class="sticky-top"><h1 class="big-title">Good evening</h1><div class="chip-row">' + chips + '</div></div><div class="dg-grid">' + tiles + '</div>' + chipFilterScript()
  return page(c, css, body)
}
function darkGridRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.dgx-hero{padding:10px 20px}.dgx-hero img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px}.dgx-heading{padding:14px 20px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.dgx-heading h1{font-size:1.25rem}.dgx-play{flex:0 0 auto;width:52px;height:52px;border-radius:50%;background:var(--accent);color:var(--accent-fg);border:0;font-size:1.3rem}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Home</a></div></div><div class="dgx-hero"><img src="' + r.image + '" alt=""></div><div class="dgx-heading"><h1>' + esc(r.title) + '</h1><button class="dgx-play">&#9825;</button></div>' + macroCells(r) + ingredientsMethod(r)
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P4 — CHIPS FEED (Uber Eats / DoorDash)
// ============================================================
function chipsFeedHome(c) {
  const chips = ['All', ...CATEGORIES].map((cat, i) => '<button class="chip ' + (i === 0 ? 'active' : '') + '" data-filter="' + cat + '">' + cat + '</button>').join('')
  const rows = RECIPES.map((r) => '<a class="cf-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><div class="cf-text"><strong>' + esc(r.title) + '</strong><p>' + esc(r.description) + '</p><span>' + r.calories + ' kcal &middot; ' + r.time + ' min</span></div></a>').join('')
  const css = `
.cf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));padding:0 20px}
.cf-row{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.cf-row img{width:88px;height:88px;border-radius:12px;object-fit:cover;flex:0 0 auto}
.cf-text{min-width:0}
.cf-text strong{font-size:.95rem}
.cf-text p{margin:4px 0;font-size:.78rem;color:var(--muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.cf-text span{font-size:.72rem;color:var(--muted)}
`
  const body = '<div class="sticky-top"><div class="search-pill" style="margin-top:14px">&#128269; Search recipes</div><div class="chip-row">' + chips + '</div></div><div class="cf-grid">' + rows + '</div>' + chipFilterScript()
  return page(c, css, body)
}
function chipsFeedRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.cfx-hero{aspect-ratio:16/9}.cfx-hero img{width:100%;height:100%;object-fit:cover}.cfx-heading{padding:14px 20px 0}.cfx-heading h1{font-size:1.25rem}.cfx-heading p{margin:6px 0 0;font-size:.85rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Browse</a></div></div><div class="cfx-hero"><img src="' + r.image + '" alt=""></div><div class="cfx-heading"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div>' + macroCells(r) + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P5 — DASHBOARD (Apple Health / Robinhood)
// ============================================================
function dashboardHome(c) {
  const groups = CATEGORIES.map((cat) => {
    const rows = RECIPES.filter((r) => r.category === cat).map((r) => '<a class="db-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '"><strong>' + esc(r.title) + '</strong><span>' + r.calories + ' kcal &middot; ' + r.protein + 'g</span></a>').join('')
    return '<section class="db-block"><div class="section-label">' + cat + '</div><div class="db-group">' + rows + '</div></section>'
  }).join('')
  const css = `
.db-stats{display:flex;gap:10px;padding:4px 20px 8px}
.db-stat{flex:1;background:var(--surface);border-radius:14px;padding:14px 10px;text-align:center}
.db-stat strong{display:block;font-size:1.3rem;color:var(--accent)}
.db-stat span{font-size:.68rem;color:var(--muted);text-transform:uppercase}
.db-sections{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:0 20px;padding:0 20px}
.db-group{background:var(--surface);border-radius:12px;overflow:hidden;margin-bottom:8px}
.db-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);min-height:44px}
.db-row:last-child{border-bottom:0}
.db-row strong{font-size:.88rem}
.db-row span{font-size:.74rem;color:var(--muted)}
.db-block .section-label{padding-left:0;padding-right:0}
`
  const body = '<div class="sticky-top"><h1 class="big-title">Overview</h1></div><div class="db-stats"><div class="db-stat"><strong>' + RECIPES.length + '</strong><span>Recipes</span></div><div class="db-stat"><strong>' + AVG_PROTEIN + 'g</strong><span>Avg protein</span></div><div class="db-stat"><strong>4</strong><span>Categories</span></div></div><div class="db-sections">' + groups + '</div>'
  return page(c, css, body)
}
function dashboardRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.dbx-head{padding:6px 20px}.dbx-head h1{font-size:1.2rem}.dbx-head p{margin:6px 0 0;font-size:.82rem;color:var(--muted)}.dbx-big{display:flex;gap:10px;padding:14px 20px}.dbx-big .db-stat{flex:1;background:var(--surface);border-radius:14px;padding:16px 8px;text-align:center}.dbx-big strong{display:block;font-size:1.5rem;color:var(--accent)}.dbx-big span{font-size:.66rem;color:var(--muted);text-transform:uppercase}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Overview</a></div></div><div class="dbx-head"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div><div class="dbx-big"><div class="db-stat"><strong>' + r.calories + '</strong><span>kcal</span></div><div class="db-stat"><strong>' + r.protein + 'g</strong><span>protein</span></div><div class="db-stat"><strong>' + r.time + '</strong><span>min</span></div></div>' + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P6 — CHECKLIST (Todoist / Bear) — no cards, plain hairline rows
// ============================================================
function checklistHome(c) {
  const tabs = ['All', ...CATEGORIES].map((cat, i) => '<button class="ck-tab ' + (i === 0 ? 'active' : '') + '" data-filter="' + cat + '">' + cat + '</button>').join('')
  const rows = RECIPES.map((r) => '<a class="ck-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '" data-cat="' + r.category + '"><span class="dot"></span><span class="ck-title">' + esc(r.title) + '</span><span class="ck-meta">' + r.calories + ' kcal</span></a>').join('')
  const css = `
.ck-tabs{display:flex;gap:18px;padding:6px 20px 10px;border-bottom:1px solid var(--border)}
.ck-tab{background:none;border:0;color:var(--muted);font-size:.86rem;font-weight:600;padding:6px 0}
.ck-tab.active{color:var(--text);box-shadow:inset 0 -2px 0 var(--accent)}
.ck-row{display:flex;align-items:center;gap:10px;padding:13px 20px;border-bottom:1px solid var(--border)}
.ck-title{flex:1;font-size:.92rem}
.ck-meta{font-size:.76rem;color:var(--muted)}
`
  const script = `<script>
document.querySelectorAll('.ck-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ck-tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach((el) => { el.style.display = (f === 'All' || el.dataset.cat === f) ? '' : 'none'; });
  });
});
</script>`
  const body = '<div class="sticky-top"><h1 class="big-title">Recipes</h1><div class="ck-tabs">' + tabs + '</div></div><div>' + rows + '</div>' + script
  return page(c, css, body)
}
function checklistRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.ckx-head{padding:16px 20px 4px}.ckx-head h1{font-size:1.2rem}.ckx-head p{margin:6px 0 0;font-size:.85rem;color:var(--muted)}.ckx-meta{padding:6px 20px 14px;font-size:.8rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Recipes</a></div></div><div class="ckx-head"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div><div class="ckx-meta">' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.carbs + 'g carbs &middot; ' + r.time + ' min</div>' + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P7 — SHELF GRID (Kindle / Apple TV) — horizontal shelves per category
// ============================================================
function shelfGridHome(c) {
  const shelves = CATEGORIES.map((cat) => {
    const covers = RECIPES.filter((r) => r.category === cat).map((r) => '<a class="sg-cover" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '"><img src="' + r.image + '" alt=""><span>' + esc(r.title) + '</span></a>').join('')
    return '<div class="section-label">' + cat + '</div><div class="sg-shelf">' + covers + '</div>'
  }).join('')
  const css = `
.sg-shelf{display:flex;gap:12px;overflow-x:auto;padding:0 20px 6px}
.sg-cover{flex:0 0 108px;display:flex;flex-direction:column;gap:6px}
.sg-cover img{width:108px;height:150px;object-fit:cover;border-radius:8px}
.sg-cover span{font-size:.76rem;line-height:1.25}
`
  const body = '<div class="sticky-top"><h1 class="big-title">Library</h1></div>' + shelves
  return page(c, css, body)
}
function shelfGridRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.sgx-cover{padding:14px 0 6px;display:flex;justify-content:center}.sgx-cover img{width:150px;height:210px;object-fit:cover;border-radius:10px;box-shadow:0 12px 24px rgba(0,0,0,.25)}.sgx-heading{text-align:center;padding:0 24px}.sgx-heading h1{font-size:1.2rem}.sgx-heading p{margin:6px 0 0;font-size:.8rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Library</a></div></div><div class="sgx-cover"><img src="' + r.image + '" alt=""></div><div class="sgx-heading"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div>' + macroCells(r) + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

// ============================================================
// P8 — SEGMENTED TABS (App Store Today) — single segmented control, one category visible at a time
// ============================================================
function segmentedTabsHome(c) {
  const segments = CATEGORIES.map((cat, i) => '<button class="seg ' + (i === 0 ? 'active' : '') + '" data-seg="' + cat + '">' + cat + '</button>').join('')
  const panels = CATEGORIES.map((cat, i) => {
    const cards = RECIPES.filter((r) => r.category === cat).map((r) => '<a class="st-card" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(c) : '#') + '"><img src="' + r.image + '" alt=""><div><strong>' + esc(r.title) + '</strong><span>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein</span></div></a>').join('')
    return '<div class="st-panel st-grid" data-segpanel="' + cat + '" style="' + (i === 0 ? '' : 'display:none') + '">' + cards + '</div>'
  }).join('')
  const css = `
.seg-wrap{display:flex;background:var(--surface);border-radius:12px;margin:4px 20px 14px;padding:3px;gap:3px}
.seg{flex:1;background:transparent;border:0;border-radius:9px;padding:8px 4px;font-size:.8rem;font-weight:600;color:var(--muted)}
.seg.active{background:var(--bg);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.st-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;padding:0 20px}
.st-card{display:flex;gap:12px;background:var(--surface);border-radius:14px;overflow:hidden;align-items:center}
.st-card img{width:96px;height:96px;object-fit:cover}
.st-card div{padding:8px 12px}
.st-card strong{font-size:.92rem}
.st-card span{display:block;margin-top:4px;font-size:.76rem;color:var(--muted)}
`
  const script = `<script>
document.querySelectorAll('[data-seg]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-seg]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('[data-segpanel]').forEach((p) => { p.style.display = p.dataset.segpanel === btn.dataset.seg ? '' : 'none'; });
  });
});
</script>`
  const body = '<div class="sticky-top"><h1 class="big-title">Today</h1><div class="seg-wrap">' + segments + '</div></div>' + panels + script
  return page(c, css, body)
}
function segmentedTabsRecipe(c) {
  const r = FEATURED_RECIPE
  const css = `.stx-hero{margin:10px 20px 0;border-radius:16px;overflow:hidden;aspect-ratio:16/10}.stx-hero img{width:100%;height:100%;object-fit:cover}.stx-heading{padding:14px 20px 0}.stx-heading h1{font-size:1.25rem}.stx-heading p{margin:6px 0 0;font-size:.85rem;color:var(--muted)}`
  const body = '<div class="sticky-top"><div class="back-row"><a href="' + fileHome(c) + '">&larr; Today</a></div></div><div class="stx-hero"><img src="' + r.image + '" alt=""></div><div class="stx-heading"><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p></div>' + macroCells(r) + ingredientsMethod(r) + actionBar()
  return page(c, css, body, fileHome(c))
}

const RENDERERS = {
  'grouped-list': { home: groupedListHome, recipe: groupedListRecipe },
  'feed-cards': { home: feedCardsHome, recipe: feedCardsRecipe },
  'dark-grid': { home: darkGridHome, recipe: darkGridRecipe },
  'chips-feed': { home: chipsFeedHome, recipe: chipsFeedRecipe },
  dashboard: { home: dashboardHome, recipe: dashboardRecipe },
  checklist: { home: checklistHome, recipe: checklistRecipe },
  'shelf-grid': { home: shelfGridHome, recipe: shelfGridRecipe },
  'segmented-tabs': { home: segmentedTabsHome, recipe: segmentedTabsRecipe },
}

CONCEPTS.forEach((c) => {
  const r = RENDERERS[c.paradigm]
  writeFileSync(join(OUT_DIR, fileHome(c)), r.home(c), 'utf-8')
  writeFileSync(join(OUT_DIR, fileRecipe(c)), r.recipe(c), 'utf-8')
})

writeFileSync(join(OUT_DIR, 'efficient-data.json'), JSON.stringify(CONCEPTS.map((c) => ({ id: c.id, order: c.order, name: c.name, group: c.group, paradigm: c.paradigm, accent: c.accent, bg: c.bg, text: c.text, blurb: c.blurb })), null, 2), 'utf-8')

console.log('Generated ' + CONCEPTS.length * 2 + ' files (' + CONCEPTS.length + ' concepts x home+recipe, ' + PARADIGMS.length + ' paradigms) in ' + OUT_DIR)
