// Generates 100 static HTML files (50 themes x home+recipe) for Dudu's Kitchen.
// Same recipe-website journey (land -> browse categories -> discover -> click -> read),
// same real 8 recipes and categories for every theme — but the LANDING PAGE COMPOSITION
// itself (hero, image usage, discovery pattern, density, navigation) genuinely differs
// across 10 structural layout templates, each with a matching recipe-page composition.
// Run with: node generate-visions.mjs
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'visions')
mkdirSync(OUT_DIR, { recursive: true })
readdirSync(OUT_DIR).forEach((f) => { if (/^theme-\d{2}-(home|recipe)\.html$/.test(f)) unlinkSync(join(OUT_DIR, f)) })

const FONTS_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Cormorant+Garamond:wght@500;600&family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@500;600&family=Bebas+Neue&family=Zilla+Slab:wght@500;700&family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@500;700&display=swap" rel="stylesheet">'

// ---------- real product data (matches DudusKitchen/src/data/recipes.ts) ----------
const CATEGORIES = ['Breakfast', 'Lunch', 'Snack', 'Dinner']
const RECIPES = [
  { id: 'berry-protein-overnight-oats', category: 'Breakfast', title: 'Berry Protein Overnight Oats', description: 'Creamy oats with skyr, berries, chia and vanilla protein for a fast post-workout breakfast.', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1400&q=85', time: 10, calories: 390, protein: 33, carbs: 48, tags: ['Meal prep', 'No cook'], ingredients: ['50 g rolled oats', '170 g plain skyr', '100 ml semi-skimmed milk', '20 g vanilla protein powder', '80 g mixed berries', '8 g chia seeds', 'Cinnamon to taste'], steps: ['Stir the oats, skyr, milk, protein powder, chia and cinnamon until smooth.', 'Cover and chill overnight, then loosen with a splash of milk if needed.', 'Finish with the berries just before eating.'], source: { label: 'Adapted from Good Food overnight oats', url: 'https://www.bbcgoodfood.com/recipes/overnight-oats' } },
  { id: 'cinnamon-banana-protein-pancakes', category: 'Breakfast', title: 'Cinnamon Banana Protein Pancakes', description: 'Blended oat pancakes with banana, eggs and whey, served with cool yogurt and berries.', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1400&q=85', time: 20, calories: 410, protein: 35, carbs: 42, tags: ['Post-workout', 'Oats'] },
  { id: 'spicy-cajun-chicken-rice', category: 'Lunch', title: 'Spicy Cajun Chicken & Rice Bowl', description: 'Smoky chicken breast, basmati rice and charred peppers with a bright lime yogurt drizzle.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85', time: 30, calories: 495, protein: 48, carbs: 55, tags: ['Spicy', 'Meal prep'] },
  { id: 'chicken-satay-crunch-bowl', category: 'Lunch', title: 'Chicken Satay Crunch Bowl', description: 'Ginger chicken, crisp vegetables and rice with a lighter chilli-peanut dressing.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=85', time: 25, calories: 470, protein: 46, carbs: 44, tags: ['Crunchy', 'Chilli'] },
  { id: 'chocolate-oat-protein-bites', category: 'Snack', title: 'Chocolate Oat Protein Bites', description: 'No-bake cocoa oat bites with whey and peanut butter for a portable training-day snack.', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1400&q=85', time: 15, calories: 210, protein: 17, carbs: 22, tags: ['No bake', 'Portable'] },
  { id: 'berry-skyr-cheesecake-cups', category: 'Snack', title: 'Berry Skyr Cheesecake Cups', description: 'A light cheesecake-style cup with skyr, soft cheese, berries and a crisp oat base.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1400&q=85', time: 15, calories: 225, protein: 21, carbs: 25, tags: ['Cheesecake', 'No bake'] },
  { id: 'chicken-karahi-rice', category: 'Dinner', title: 'Chicken Karahi with Basmati Rice', description: 'A punchy tomato, ginger and green chilli chicken skillet with a measured serving of rice.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1400&q=85', time: 40, calories: 520, protein: 52, carbs: 53, tags: ['Hot', 'One pan'] },
  { id: 'lighter-chicken-biryani', category: 'Dinner', title: 'Lighter Chicken Biryani', description: 'Fragrant chicken and rice layered with warm spices, peas, herbs and cooling yogurt.', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1400&q=85', time: 45, calories: 535, protein: 45, carbs: 62, tags: ['Spiced', 'Batch cook'] },
]
const FEATURED_RECIPE = RECIPES[0]
const AVG_PROTEIN = Math.round(RECIPES.reduce((sum, r) => sum + r.protein, 0) / RECIPES.length)

// ---------- 50 pure visual themes (matches DudusKitchen/src/data/themes.ts) ----------
const PLAYFAIR = "'Playfair Display', Georgia, 'Times New Roman', serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"
const SPACE_GROTESK = "'Space Grotesk', 'Segoe UI', sans-serif"
const PLEX_MONO = "'IBM Plex Mono', Consolas, monospace"
const BEBAS = "'Bebas Neue', 'Arial Narrow', sans-serif"
const ZILLA = "'Zilla Slab', Georgia, serif"
const BASKERVILLE = "'Libre Baskerville', Georgia, serif"
const DM_SANS = "'DM Sans', 'Segoe UI', sans-serif"

const THEMES = [
  { id: 'michelin-noir', name: 'Michelin Noir', mode: 'dark', bg: '#0B0B0C', text: '#F3EDE4', accent: '#C8102E', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Restrained, authoritative — food worth traveling for.' },
  { id: 'tokyo-midnight', name: 'Tokyo Midnight Kitchen', mode: 'dark', bg: '#101012', text: '#F5F1E8', accent: '#BC002D', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Extreme negative space, one red accent, total calm.' },
  { id: 'brutalist-broadsheet', name: 'Brutalist Broadsheet', mode: 'dark', bg: '#000000', text: '#FFFFFF', accent: '#B3001B', accentFg: '#FFFFFF', font: BEBAS, blurb: 'Raw, confrontational, newsprint energy.' },
  { id: 'maison-rouge', name: 'Maison Rouge', mode: 'dark', bg: '#0C0C0D', text: '#F2EDE6', accent: '#A6192E', accentFg: '#FFFFFF', font: CORMORANT, blurb: 'Fashion-house poise, gold hairlines, couture pacing.' },
  { id: 'neon-wok', name: 'Neon Wok', mode: 'dark', bg: '#08080A', text: '#F5F5F7', accent: '#FF1F4B', accentFg: '#FFFFFF', font: PLEX_MONO, blurb: 'Cyberpunk night-market energy, glowing and alive.' },
  { id: 'nordic-ember', name: 'Nordic Ember', mode: 'dark', bg: '#16161A', text: '#EFE7DA', accent: '#C1440E', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Scandinavian calm with one warm ember accent.' },
  { id: 'journal-rouge', name: 'Le Journal Rouge', mode: 'dark', bg: '#111111', text: '#F1EAD9', accent: '#C1272D', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Recipes written like front-page news.' },
  { id: 'matador', name: 'Matador', mode: 'dark', bg: '#0A0A0A', text: '#F4EFE6', accent: '#D0021B', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Dramatic, theatrical, a sweep of cape-red confidence.' },
  { id: 'obsidian-atelier', name: 'Obsidian Atelier', mode: 'dark', bg: '#030303', text: '#FFFFFF', accent: '#E0102A', accentFg: '#FFFFFF', font: CORMORANT, blurb: 'Every recipe treated like a spotlit art object.' },
  { id: 'red-thread', name: 'Red Thread', mode: 'dark', bg: '#0D0D0F', text: '#EFE6D8', accent: '#D62839', accentFg: '#FFFFFF', font: ZILLA, blurb: 'A connective narrative thread runs through everything.' },
  { id: 'ferrari-kitchen', name: 'Ferrari Kitchen', mode: 'dark', bg: '#0A0A0C', text: '#F5F5F5', accent: '#D40000', accentFg: '#FFFFFF', font: SPACE_GROTESK, blurb: 'Italian performance-luxury, nutrition as engineering.' },
  { id: 'kabuki-stage', name: 'Kabuki Stage', mode: 'dark', bg: '#0B0B0D', text: '#F6F1E7', accent: '#C41E3A', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Theatrical reveal, every recipe an entrance.' },
  { id: 'data-chef', name: 'Data Chef', mode: 'dark', bg: '#08090A', text: '#E8ECEA', accent: '#FF2E44', accentFg: '#FFFFFF', font: PLEX_MONO, blurb: 'Nutrition presented like transparent live data.' },
  { id: 'velvet-rope', name: 'Velvet Rope', mode: 'dark', bg: '#0A0708', text: '#EFE6D8', accent: '#7A0C1E', accentFg: '#FFFFFF', font: CORMORANT, blurb: 'Moody, exclusive, members-only warmth.' },
  { id: 'ink-ember', name: 'Ink & Ember', mode: 'dark', bg: '#0C0C0C', text: '#F2ECDD', accent: '#B22222', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Calligraphic, contemplative, a red seal as signature.' },
  { id: 'race-card', name: 'Race Card', mode: 'dark', bg: '#101012', text: '#FAFAFA', accent: '#D7263D', accentFg: '#FFFFFF', font: SPACE_GROTESK, blurb: 'Cook time as a lap split, performance gamified.' },
  { id: 'opera-rouge', name: 'Opera Rouge', mode: 'dark', bg: '#0B0708', text: '#F1E7D8', accent: '#7C0A02', accentFg: '#FFFFFF', font: CORMORANT, blurb: 'Grand, operatic, romantic — cooking as performance.' },
  { id: 'static-steel', name: 'Static & Steel', mode: 'dark', bg: '#101214', text: '#F1F2F2', accent: '#D62828', accentFg: '#FFFFFF', font: SPACE_GROTESK, blurb: 'Industrial honesty of a real commercial kitchen.' },
  { id: 'crimson-zen', name: 'Crimson Zen', mode: 'dark', bg: '#0A0A0A', text: '#F5F2EA', accent: '#C1121F', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Meditative, disciplined, one red circle as the mark.' },
  { id: 'death-row-diner', name: 'Death Row Diner', mode: 'dark', bg: '#0C0C0C', text: '#F2E9D8', accent: '#FF073A', accentFg: '#FFFFFF', font: BEBAS, blurb: 'Retro-Americana neon-diner rebellion.' },
  { id: 'red-room', name: 'The Red Room', mode: 'dark', bg: '#050505', text: '#EDEDED', accent: '#8A0303', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Surreal, cinematic, unsettling-elegant mood.' },
  { id: 'sumo-ring', name: 'Sumo Ring', mode: 'dark', bg: '#0A0A0A', text: '#F4F1EA', accent: '#C0272D', accentFg: '#FFFFFF', font: ZILLA, blurb: 'Ceremonial strength, ritual and respect.' },
  { id: 'rouge-vif', name: 'Rouge Vif Editorial', mode: 'dark', bg: '#000000', text: '#FFFFFF', accent: '#E2001A', accentFg: '#FFFFFF', font: BEBAS, blurb: 'Parisian fashion-magazine confidence and swagger.' },
  { id: 'ember-ash', name: 'Ember & Ash', mode: 'dark', bg: '#131110', text: '#EFE6D6', accent: '#C1440E', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Rustic live-fire cooking, slow and honest.' },
  { id: 'circuit-kitchen', name: 'Circuit Kitchen', mode: 'dark', bg: '#0A0C0A', text: '#EAEFEA', accent: '#FF2D55', accentFg: '#FFFFFF', font: PLEX_MONO, blurb: 'The body as an engineered system to optimize.' },
  { id: 'blood-orange-noir', name: 'Blood Orange Noir', mode: 'dark', bg: '#0A0808', text: '#EFE6D8', accent: '#D2401E', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Film-noir mystery warmed by blood-orange glow.' },
  { id: 'scarlet-ledger', name: 'Scarlet Ledger', mode: 'dark', bg: '#14100D', text: '#E9DEC4', accent: '#A32020', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Old-world ledger charm, wax-seal permanence.' },
  { id: 'akira-red', name: 'Akira Red', mode: 'dark', bg: '#08080B', text: '#F4F4F8', accent: '#E2001A', accentFg: '#FFFFFF', font: BEBAS, blurb: 'Anime-cyberpunk Tokyo, bold and kinetic.' },
  { id: 'red-thread-tradition', name: 'The Red Thread of Tradition', mode: 'dark', bg: '#101010', text: '#F1E6D2', accent: '#B3222D', accentFg: '#FFFFFF', font: ZILLA, blurb: 'Nostalgic family-recipe warmth, modernized.' },
  { id: 'monolith', name: 'Monolith', mode: 'dark', bg: '#000000', text: '#F5F5F3', accent: '#C1121F', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Ultra-minimal, monumental, sculptural restraint.' },
  { id: 'ivory-sage', name: 'Ivory & Sage', mode: 'light', bg: '#F6F3EC', text: '#2E2C28', accent: '#8A9A83', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Calm, wholesome, unhurried Kinfolk-style gentleness.' },
  { id: 'terracotta-sud', name: 'Terracotta Sud', mode: 'light', bg: '#F4E9D8', text: '#3B2E27', accent: '#C1622D', accentFg: '#FFFFFF', font: PLAYFAIR, blurb: 'Sun-baked Mediterranean market-day warmth.' },
  { id: 'champagne-atelier', name: 'Champagne Atelier', mode: 'light', bg: '#FAF6EE', text: '#2A2724', accent: '#C79A6B', accentFg: '#2A2724', font: CORMORANT, blurb: 'Quiet-luxury patisserie elegance, precise and delicate.' },
  { id: 'emerald-reserve', name: 'Emerald Reserve', mode: 'dark', bg: '#14432A', text: '#F1EADB', accent: '#B08D57', accentFg: '#14100D', font: CORMORANT, blurb: 'Members-club, wine-cellar sophistication.' },
  { id: 'copper-forge', name: 'Copper Forge', mode: 'dark', bg: '#262220', text: '#EFE6D6', accent: '#B5622A', accentFg: '#FFFFFF', font: ZILLA, blurb: 'Artisanal, tactile, hand-forged craft warmth.' },
  { id: 'navy-nautical', name: 'Navy Nautical Table', mode: 'dark', bg: '#142238', text: '#F4F4F2', accent: '#B08D57', accentFg: '#14100D', font: CORMORANT, blurb: 'Coastal fine-dining, yacht-club elegance.' },
  { id: 'sage-linen', name: 'Sage & Linen', mode: 'light', bg: '#F1ECE1', text: '#2E2C28', accent: '#93A186', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Scandinavian wellness calm, soft and functional.' },
  { id: 'golden-hour', name: 'Golden Hour Kitchen', mode: 'dark', bg: '#3A2A20', text: '#F3E7D2', accent: '#C98A2C', accentFg: '#2A1B12', font: PLAYFAIR, blurb: 'Warm, cinematic, golden-lit food storytelling.' },
  { id: 'deep-purple-nightshade', name: 'Deep Purple Nightshade', mode: 'dark', bg: '#3A1B33', text: '#F3EAE4', accent: '#E8B4BC', accentFg: '#3A1B33', font: CORMORANT, blurb: 'Moody, romantic, evening-dinner sophistication.' },
  { id: 'charcoal-chalk', name: 'Charcoal & Chalk', mode: 'dark', bg: '#2B2B2B', text: '#F2F0EA', accent: '#C99A2E', accentFg: '#2A2724', font: ZILLA, blurb: 'Modern bistro, handwritten specials-board charm.' },
  { id: 'olive-grove', name: 'Olive Grove', mode: 'light', bg: '#F6F0E2', text: '#3B2E27', accent: '#6E7150', accentFg: '#FFFFFF', font: BASKERVILLE, blurb: 'Sun-drenched Mediterranean wellness, organic and grounded.' },
  { id: 'warm-beige-studio', name: 'Warm Beige Studio', mode: 'light', bg: '#E7DFD1', text: '#2A2724', accent: '#B5622A', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Notion/Aesop-style quiet minimalism.' },
  { id: 'vibrant-citrus-pop', name: 'Vibrant Citrus Pop', mode: 'light', bg: '#FFFFFF', text: '#232323', accent: '#FF7A29', accentFg: '#FFFFFF', font: SPACE_GROTESK, blurb: 'Playful, energetic, Sweetgreen-style modern app energy.' },
  { id: 'cocoa-cream', name: 'Cocoa & Cream', mode: 'light', bg: '#F3E6D6', text: '#4A2E22', accent: '#C79A6B', accentFg: '#4A2E22', font: CORMORANT, blurb: 'Chocolatier warmth with precise, refined restraint.' },
  { id: 'slate-sea-glass', name: 'Slate & Sea Glass', mode: 'light', bg: '#F4F6F5', text: '#3E4A54', accent: '#9FC1BA', accentFg: '#1E2B30', font: DM_SANS, blurb: 'Modern coastal wellness, breathing-app calm.' },
  { id: 'saffron-souk', name: 'Saffron Souk', mode: 'light', bg: '#F1E6CE', text: '#124A45', accent: '#D8A417', accentFg: '#14100D', font: PLAYFAIR, blurb: 'Vibrant Moroccan spice-market energy.' },
  { id: 'blush-bronze', name: 'Blush & Bronze', mode: 'light', bg: '#F6F1EA', text: '#3A2A20', accent: '#A9782F', accentFg: '#FFFFFF', font: CORMORANT, blurb: 'Modern feminine luxury, soft curves and confidence.' },
  { id: 'forest-table', name: 'Forest Table', mode: 'dark', bg: '#1F3B2C', text: '#EFE7DA', accent: '#6E7B5E', accentFg: '#14100D', font: BASKERVILLE, blurb: 'New-Nordic foraging-chef aesthetic.' },
  { id: 'monochrome-stone', name: 'Monochrome Stone', mode: 'light', bg: '#F4F1EA', text: '#2A2724', accent: '#A39C8C', accentFg: '#FFFFFF', font: DM_SANS, blurb: 'Architectural minimalism, Kinfolk meets Muji.' },
  { id: 'electric-indigo-lab', name: 'Electric Indigo Lab', mode: 'dark', bg: '#2A1E5C', text: '#F4F4F8', accent: '#3D5AFE', accentFg: '#FFFFFF', font: PLEX_MONO, blurb: 'Experimental food-science precision.' },
]

// ---------- 10 genuinely different landing-page + recipe-page compositions ----------
const LAYOUTS = ['cinematic-rows', 'magazine', 'bento', 'masonry', 'storytelling', 'split-screen', 'filmstrip', 'cardless', 'collage-hero', 'dense-grid']
THEMES.forEach((t, i) => { t.order = i + 1; t.layout = LAYOUTS[i % LAYOUTS.length] })

function esc(str) { return String(str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) }
function pad(n) { return String(n).padStart(2, '0') }
function fileHome(t) { return 'theme-' + pad(t.order) + '-home.html' }
function fileRecipe(t) { return 'theme-' + pad(t.order) + '-recipe.html' }

function themeVars(t) {
  const { bg, text, accent, accentFg } = t
  const shared = { '--cp-accent': accent, '--cp-accent-hover': 'color-mix(in srgb, ' + accent + ' 82%, black 18%)', '--cp-accent-soft': 'color-mix(in srgb, ' + accent + ' 14%, transparent)', '--cp-accent-fg': accentFg, '--cp-link': accent, '--theme-font-display': t.font }
  const vars = t.mode === 'dark'
    ? { '--cp-bg': bg, '--cp-bg-elevated': 'color-mix(in srgb, ' + bg + ' 85%, white 15%)', '--cp-surface': 'color-mix(in srgb, ' + bg + ' 78%, white 22%)', '--cp-surface-soft': 'color-mix(in srgb, ' + bg + ' 82%, white 18%)', '--cp-border': 'color-mix(in srgb, ' + text + ' 22%, transparent)', '--cp-text': text, '--cp-text-muted': 'color-mix(in srgb, ' + text + ' 68%, ' + bg + ' 32%)', '--cp-text-soft': 'color-mix(in srgb, ' + text + ' 55%, ' + bg + ' 45%)' }
    : { '--cp-bg': bg, '--cp-bg-elevated': 'color-mix(in srgb, white 55%, ' + bg + ' 45%)', '--cp-surface': 'color-mix(in srgb, white 85%, ' + bg + ' 15%)', '--cp-surface-soft': 'color-mix(in srgb, white 70%, ' + bg + ' 30%)', '--cp-border': 'color-mix(in srgb, ' + text + ' 14%, transparent)', '--cp-text': text, '--cp-text-muted': 'color-mix(in srgb, ' + text + ' 72%, white 28%)', '--cp-text-soft': 'color-mix(in srgb, ' + text + ' 55%, white 45%)' }
  return ':root{' + Object.entries({ ...vars, ...shared }).map(([k, v]) => k + ':' + v).join(';') + '}'
}

const BASE_CSS = `
*{box-sizing:border-box}
html{background:var(--cp-bg);scroll-behavior:smooth}
body{background:var(--cp-bg);color:var(--cp-text);font-family:"Segoe UI",Aptos,sans-serif;margin:0;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:var(--cp-link)}
button{cursor:pointer;font-family:inherit}
h1,h2,h3,h4{font-family:var(--theme-font-display,inherit)}
.brand{color:inherit;font-weight:750;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.brand-mark{background:var(--cp-accent);color:var(--cp-accent-fg);border-radius:8px;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;font-size:15px}
.cat-chip{background:var(--cp-surface);border:1px solid var(--cp-border);border-radius:999px;color:var(--cp-text-muted);font-size:.78rem;font-weight:650;padding:8px 14px}
.cat-chip.active{background:var(--cp-accent);color:var(--cp-accent-fg);border-color:var(--cp-accent)}
.rd-ingredients ul,.rd-method ol{margin:0;padding-left:20px;line-height:1.8;font-size:.92rem;color:var(--cp-text-soft)}
.rd-actions{display:flex;gap:10px;flex-wrap:wrap}
.rd-actions button{background:transparent;border:1px solid var(--cp-accent);color:var(--cp-accent);padding:10px 18px;border-radius:.625rem;font:inherit;font-size:.85rem}
.rd-actions button.primary{background:var(--cp-accent);color:var(--cp-accent-fg)}
.review-bar{position:fixed;bottom:14px;left:14px;z-index:999;background:rgba(20,18,14,.88);color:#efe9df;font:600 11px/1 "Segoe UI",sans-serif;letter-spacing:.02em;padding:8px 12px;border-radius:8px;text-decoration:none;border:1px solid rgba(255,255,255,.14)}
.review-bar:hover{border-color:#c9a227}
.review-bar-home{bottom:52px}
.about-panel{position:fixed;bottom:14px;right:14px;z-index:999;max-width:280px;background:rgba(20,18,14,.92);color:#efe9df;font:12px/1.5 "Segoe UI",sans-serif;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14)}
.about-panel summary{cursor:pointer;font-weight:700;list-style:none}
.about-panel summary::-webkit-details-marker{display:none}
.about-panel summary::before{content:"+ "}
.about-panel[open] summary::before{content:"\\2212 "}
.about-panel p{margin:8px 0 0;color:#cfc7ba}
`

function reviewBar(t, homeHref) {
  const backHome = homeHref ? '<a class="review-bar review-bar-home" href="' + homeHref + '">&larr; Back to ' + esc(t.name) + ' home</a>' : ''
  return backHome + '<a class="review-bar" href="../visions-index.html">&larr; Back to gallery &middot; Theme ' + pad(t.order) + '/50 &middot; ' + esc(t.name) + ' &middot; layout: ' + t.layout + '</a>'
}
function aboutPanel(t) { return '<details class="about-panel"><summary>About this theme</summary><p>' + esc(t.blurb) + ' (layout: ' + t.layout + ')</p></details>' }
function page(t, extraCss, bodyInner, homeHref) {
  return '<!doctype html>\n<html lang="en" data-layout="' + t.layout + '">\n<head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + esc(t.name) + " — Dudu's Kitchen</title>\n" + FONTS_LINK + '\n<style>\n' + themeVars(t) + '\n' + BASE_CSS + '\n' + extraCss + '\n</style>\n</head>\n<body>\n' + bodyInner + '\n' + reviewBar(t, homeHref) + '\n' + aboutPanel(t) + '\n</body>\n</html>'
}
function ingredientsMethod(recipe) {
  return '<div class="rd-ingredients"><h3>Ingredients</h3><ul>' + recipe.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>' +
    '<div class="rd-method"><h3>Method</h3><ol>' + recipe.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol></div>'
}
function macroRow(r) {
  return '<span><strong>' + r.calories + '</strong> kcal</span><span><strong>' + r.protein + 'g</strong> protein</span><span><strong>' + r.carbs + 'g</strong> carbs</span><span><strong>' + r.time + '</strong> min</span><span><strong>1</strong> serving</span>'
}
function catFilterScript() {
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
// LAYOUT 1 — CINEMATIC ROWS: full-bleed hero + Netflix-style horizontal category rows
// ============================================================
function cinematicHome(t) {
  const rows = CATEGORIES.map((cat) => {
    const items = RECIPES.filter((r) => r.category === cat)
    const cards = items.map((r) => '<div class="cr-card" style="background-image:url(' + r.image + ')"><div class="cr-fade"></div><span class="cr-cat">' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.time + ' min</p></div>').join('')
    return '<section class="cr-row"><h2>' + cat + '</h2><div class="cr-scroll">' + cards + '</div></section>'
  }).join('')
  const css = `
.cr-hero{height:94vh;position:relative;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.85)),url(${FEATURED_RECIPE.image});background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:space-between}
.cr-topnav{display:flex;justify-content:space-between;align-items:center;padding:24px clamp(20px,4vw,56px);color:#fff}
.cr-topnav .brand-mark{background:var(--cp-accent)}
.cr-hero-content{padding:0 clamp(20px,4vw,56px) 70px;max-width:640px}
.cr-kicker{color:var(--cp-accent);text-transform:uppercase;letter-spacing:.2em;font-size:.75rem;font-weight:700}
.cr-hero-content h1{font-size:clamp(2.6rem,6vw,4.6rem);margin:14px 0;line-height:1}
.cr-hero-content p{opacity:.85;font-size:1.05rem;max-width:480px}
.cr-hero-stats{display:flex;gap:20px;margin-top:20px;font-size:.85rem}
.cr-row{padding:36px clamp(20px,4vw,56px) 0}
.cr-row h2{font-size:1.1rem;margin-bottom:14px}
.cr-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px}
.cr-card{flex:0 0 300px;aspect-ratio:16/10;border-radius:12px;background-size:cover;background-position:center;position:relative;overflow:hidden;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:16px}
.cr-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75),transparent 55%)}
.cr-cat{position:relative;background:var(--cp-accent);color:var(--cp-accent-fg);font-size:.65rem;font-weight:700;padding:4px 8px;border-radius:6px;align-self:flex-start;margin-bottom:auto;text-transform:uppercase}
.cr-card h4,.cr-card p{position:relative;margin:0}
.cr-card h4{font-size:1.05rem;margin-top:8px}
.cr-card p{font-size:.75rem;opacity:.85;margin-top:4px}
.cr-footer{padding:40px clamp(20px,4vw,56px);color:var(--cp-text-muted);font-size:.78rem}
@media (max-width:720px){.cr-card{flex-basis:240px}}
`
  const body = '<div class="cr-hero"><div class="cr-topnav"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><span>Fuel well. Train strong.</span></div><div class="cr-hero-content"><p class="cr-kicker">Featured this week</p><h1>' + esc(FEATURED_RECIPE.title) + '</h1><p>' + esc(FEATURED_RECIPE.description) + '</p><div class="cr-hero-stats"><span>' + FEATURED_RECIPE.calories + ' kcal</span><span>' + FEATURED_RECIPE.protein + 'g protein</span><a href="' + fileRecipe(t) + '" style="color:#fff;font-weight:700">View recipe &rarr;</a></div></div></div>' + rows + '<div class="cr-footer">Dudu\'s Kitchen &middot; ' + RECIPES.length + ' recipes &middot; ' + AVG_PROTEIN + 'g avg protein</div>'
  return page(t, css, body)
}
function cinematicRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.cr-rhero{height:70vh;position:relative;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.85)),url(${r.image});background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:space-between}
.cr-rnav{padding:24px clamp(20px,4vw,56px);display:flex;justify-content:space-between}
.cr-rnav a{color:#fff}
.cr-rheading{padding:0 clamp(20px,4vw,56px) 50px}
.cr-rheading h1{font-size:clamp(2.2rem,5vw,3.4rem);margin:0 0 10px}
.cr-panel{max-width:900px;margin:0 auto;padding:40px clamp(20px,4vw,40px) 70px}
.cr-macros{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:30px;font-size:.85rem}
.cr-grid{display:grid;grid-template-columns:1fr 1.3fr;gap:40px;margin-bottom:36px}
`
  const body = '<div class="cr-rhero"><div class="cr-rnav"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><a href="' + fileHome(t) + '">&larr; All recipes</a></div><div class="cr-rheading"><h1>' + esc(r.title) + '</h1><p style="max-width:520px;opacity:.85">' + esc(r.description) + '</p></div></div><div class="cr-panel"><div class="cr-macros">' + macroRow(r) + '</div><div class="cr-grid">' + ingredientsMethod(r) + '</div><div class="rd-actions"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 2 — MAGAZINE: masthead + asymmetric cover story + mixed-size editorial grid
// ============================================================
function magazineHome(t) {
  const others = RECIPES.filter((r) => r.id !== FEATURED_RECIPE.id)
  const big = new Set([0, 4]) // indices that render as wide 2-col tiles
  const tiles = others.map((r, i) => '<div class="mg-tile ' + (big.has(i) ? 'mg-wide' : '') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><div class="mg-tile-body"><span>' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein</p></div></div>').join('')
  const filters = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="cat-chip ' + (c === 'All' ? 'active' : '') + '">' + c + '</button>').join('')
  const css = `
.mg-masthead{text-align:center;padding:30px 20px 16px;border-bottom:3px solid var(--cp-text)}
.mg-masthead h1{font-size:2.6rem;margin:0}
.mg-masthead p{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;opacity:.6;margin-top:6px}
.mg-cover{max-width:1100px;margin:0 auto;padding:44px 24px;display:grid;grid-template-columns:1.4fr 1fr;gap:40px;border-bottom:1px solid var(--cp-border)}
.mg-cover img{width:100%;height:380px;object-fit:cover;border-radius:4px}
.mg-cover h2{font-size:2.4rem;margin:14px 0}
.mg-cover p{color:var(--cp-text-soft);line-height:1.6}
.mg-cover a{font-weight:700;display:inline-block;margin-top:14px}
.mg-filters{display:flex;gap:8px;justify-content:center;padding:24px;flex-wrap:wrap}
.mg-grid{max-width:1100px;margin:0 auto;padding:0 24px 60px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.mg-tile{border:1px solid var(--cp-border);overflow:hidden}
.mg-tile.mg-wide{grid-column:span 2}
.mg-tile img{height:180px;width:100%;object-fit:cover}
.mg-tile.mg-wide img{height:220px}
.mg-tile-body{padding:14px}
.mg-tile-body span{color:var(--cp-accent);font-size:.65rem;text-transform:uppercase;font-weight:700}
.mg-tile-body h4{margin:8px 0 4px}
.mg-tile-body p{margin:0;font-size:.78rem;color:var(--cp-text-muted)}
@media (max-width:800px){.mg-cover{grid-template-columns:1fr}.mg-grid{grid-template-columns:1fr}.mg-tile.mg-wide{grid-column:span 1}}
`
  const body = '<div class="mg-masthead"><h1>' + esc(t.name) + '</h1><p>' + esc(t.blurb) + ' &middot; Issue No. ' + pad(t.order) + '</p></div>' +
    '<div class="mg-cover"><img src="' + FEATURED_RECIPE.image + '" alt=""><div><span class="cat-chip">' + FEATURED_RECIPE.category + '</span><h2>' + esc(FEATURED_RECIPE.title) + '</h2><p>' + esc(FEATURED_RECIPE.description) + ' ' + FEATURED_RECIPE.calories + ' kcal, ' + FEATURED_RECIPE.protein + 'g protein.</p><a href="' + fileRecipe(t) + '">Read the recipe &rarr;</a></div></div>' +
    '<div class="mg-filters">' + filters + '</div><div class="mg-grid">' + tiles + '</div>' + catFilterScript()
  return page(t, css, body)
}
function magazineRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.mg-masthead{text-align:center;padding:20px;border-bottom:3px solid var(--cp-text);font-size:.8rem}
.mg-masthead a{color:var(--cp-text)}
.mg-article{max-width:760px;margin:0 auto;padding:40px 24px 70px}
.mg-article h1{font-size:2.4rem;margin:0 0 8px}
.mg-byline{color:var(--cp-text-muted);font-size:.8rem;margin-bottom:24px}
.mg-article img{width:100%;height:320px;object-fit:cover;margin-bottom:24px}
.mg-body{display:grid;grid-template-columns:1fr 240px;gap:36px}
.mg-sidebar{border-left:2px solid var(--cp-accent);padding-left:18px}
@media (max-width:700px){.mg-body{grid-template-columns:1fr}}
`
  const body = '<div class="mg-masthead"><a href="' + fileHome(t) + '">&larr; Back to Front Page</a></div><div class="mg-article"><h1>' + esc(r.title) + '</h1><p class="mg-byline">' + esc(t.name) + ' &middot; ' + macroRow(r) + '</p><img src="' + r.image + '" alt=""><div class="mg-body"><div class="rd-method"><h3>Method</h3><ol>' + r.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol><div class="rd-actions" style="margin-top:24px"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div><div class="mg-sidebar rd-ingredients"><h3>Ingredients</h3><ul>' + r.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 3 — BENTO: the homepage IS a mosaic grid of varied tile sizes, no separate hero
// ============================================================
function bentoHome(t) {
  const spanClasses = ['bt-xl', 'bt-tall', 'bt-wide', 'bt-md', 'bt-md', 'bt-wide', 'bt-tall', 'bt-md']
  const tiles = RECIPES.map((r, i) => '<a class="bt-tile ' + spanClasses[i] + '" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(t) : '#') + '" data-cat="' + r.category + '" style="background-image:url(' + r.image + ')"><div class="bt-overlay"></div><span class="bt-cat">' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g</p></a>').join('')
  const filters = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="cat-chip ' + (c === 'All' ? 'active' : '') + '">' + c + '</button>').join('')
  const css = `
.bt-top{display:flex;justify-content:space-between;align-items:center;padding:20px clamp(20px,4vw,48px)}
.bt-filters{display:flex;gap:8px;flex-wrap:wrap}
.bt-grid{padding:0 clamp(20px,4vw,48px) 60px;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:130px;gap:14px}
.bt-tile{position:relative;border-radius:14px;overflow:hidden;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;text-decoration:none}
.bt-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent 60%)}
.bt-tile span,.bt-tile h4,.bt-tile p{position:relative;margin:0}
.bt-tile h4{font-size:1rem;margin-top:6px}
.bt-tile p{font-size:.72rem;opacity:.85}
.bt-cat{background:var(--cp-accent);color:var(--cp-accent-fg);font-size:.62rem;font-weight:700;padding:3px 7px;border-radius:5px;align-self:flex-start;text-transform:uppercase}
.bt-xl{grid-column:span 2;grid-row:span 2}
.bt-tall{grid-row:span 2}
.bt-wide{grid-column:span 2}
.bt-md{grid-column:span 1}
@media (max-width:800px){.bt-grid{grid-template-columns:repeat(2,1fr)}.bt-xl,.bt-wide{grid-column:span 2}}
`
  const body = '<div class="bt-top"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><div class="bt-filters">' + filters + '</div></div><div class="bt-grid">' + tiles + '</div>' + catFilterScript()
  return page(t, css, body)
}
function bentoRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.bx-top{padding:20px clamp(20px,4vw,48px);display:flex;justify-content:space-between}
.bx-grid{padding:0 clamp(20px,4vw,48px) 60px;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:110px;gap:14px}
.bx-cell{background:var(--cp-surface);border:1px solid var(--cp-border);border-radius:14px;padding:16px;overflow:auto}
.bx-img{grid-column:span 2;grid-row:span 3;background-size:cover;background-position:center;border-radius:14px}
.bx-title{grid-column:span 2;grid-row:span 2;overflow:visible}
.bx-title h1{margin:0;font-size:1.5rem}
.bx-macros{grid-column:span 2;grid-row:span 1;display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:.82rem;overflow:visible}
.bx-ing{grid-column:span 2;grid-row:span 3}
.bx-method{grid-column:span 2;grid-row:span 3}
.bx-actions{grid-column:span 4;grid-row:span 1;display:flex;align-items:center;gap:10px}
@media (max-width:800px){.bx-grid{grid-template-columns:repeat(2,1fr)}.bx-img,.bx-title,.bx-macros,.bx-ing,.bx-method,.bx-actions{grid-column:span 2}}
`
  const body = '<div class="bx-top"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><a href="' + fileHome(t) + '">&larr; Back to mosaic</a></div><div class="bx-grid"><div class="bx-img" style="background-image:url(' + r.image + ')"></div><div class="bx-cell bx-title"><h1>' + esc(r.title) + '</h1><p style="color:var(--cp-text-muted);font-size:.85rem">' + esc(r.description) + '</p></div><div class="bx-cell bx-macros">' + macroRow(r) + '</div><div class="bx-cell bx-ing rd-ingredients"><h3>Ingredients</h3><ul>' + r.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div><div class="bx-cell bx-method rd-method"><h3>Method</h3><ol>' + r.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol></div><div class="bx-cell bx-actions"><button class="rd-actions primary" style="border:1px solid var(--cp-accent);background:var(--cp-accent);color:var(--cp-accent-fg);padding:10px 18px;border-radius:8px">&#9825; Save recipe</button><button style="border:1px solid var(--cp-accent);color:var(--cp-accent);background:transparent;padding:10px 18px;border-radius:8px">Share</button></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 4 — MASONRY: Pinterest-style immediate discovery, no separate hero
// ============================================================
function masonryHome(t) {
  const heights = [340, 260, 300, 420, 240, 360, 280, 320]
  const tiles = RECIPES.map((r, i) => '<a class="mn-pin" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(t) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" style="height:' + heights[i] + 'px" alt=""><div class="mn-body"><span>' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein</p></div></a>').join('')
  const filters = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="cat-chip ' + (c === 'All' ? 'active' : '') + '">' + c + '</button>').join('')
  const css = `
.mn-top{display:flex;flex-direction:column;align-items:center;gap:14px;padding:30px 20px}
.mn-top h1{margin:0;font-size:1.6rem}
.mn-search{border:1px solid var(--cp-border);border-radius:999px;padding:10px 18px;background:var(--cp-surface);width:100%;max-width:360px;color:var(--cp-text)}
.mn-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.mn-masonry{column-count:4;column-gap:16px;padding:0 24px 60px}
.mn-pin{display:block;break-inside:avoid;margin-bottom:16px;text-decoration:none;color:inherit;border-radius:16px;overflow:hidden;background:var(--cp-surface);border:1px solid var(--cp-border)}
.mn-pin img{width:100%;object-fit:cover}
.mn-body{padding:12px 14px}
.mn-body span{color:var(--cp-accent);font-size:.62rem;text-transform:uppercase;font-weight:700}
.mn-body h4{margin:6px 0 4px;font-size:1rem}
.mn-body p{margin:0;font-size:.75rem;color:var(--cp-text-muted)}
@media (max-width:900px){.mn-masonry{column-count:2}}
`
  const body = '<div class="mn-top"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><h1>Discover what to cook</h1><input class="mn-search" placeholder="Search recipes" disabled><div class="mn-filters">' + filters + '</div></div><div class="mn-masonry">' + tiles + '</div>' + catFilterScript()
  return page(t, css, body)
}
function masonryRecipe(t) {
  const r = FEATURED_RECIPE
  const others = RECIPES.filter((x) => x.id !== r.id).slice(0, 4)
  const strip = others.map((x) => '<div class="mn-mini"><img src="' + x.image + '" alt=""></div>').join('')
  const css = `
.mn-detail{max-width:560px;margin:0 auto;padding:36px 24px 70px}
.mn-detail a.back{font-size:.85rem;color:var(--cp-text-muted)}
.mn-detail-img{position:relative;margin:20px 0}
.mn-detail-img img{width:100%;border-radius:20px;max-height:440px;object-fit:cover}
.mn-save{position:absolute;top:16px;right:16px;background:var(--cp-accent);color:var(--cp-accent-fg);border:0;border-radius:999px;padding:10px 18px;font-weight:700}
.mn-related{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:30px}
.mn-mini img{width:100%;height:80px;object-fit:cover;border-radius:10px}
`
  const body = '<div class="mn-detail"><a class="back" href="' + fileHome(t) + '">&larr; Back to boards</a><div class="mn-detail-img"><img src="' + r.image + '" alt=""><button class="mn-save">&#9825; Save</button></div><h1>' + esc(r.title) + '</h1><p>' + esc(r.description) + '</p>' + '<div style="display:flex;gap:16px;margin:16px 0;font-size:.85rem">' + macroRow(r) + '</div>' + ingredientsMethod(r) + '<div class="rd-actions" style="margin-top:16px"><button>Share</button></div><h3 style="margin-top:30px">More like this</h3><div class="mn-related">' + strip + '</div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 5 — STORYTELLING: Apple-style alternating full-width narrative sections per category
// ============================================================
function storytellingHome(t) {
  const sections = CATEGORIES.map((cat, i) => {
    const items = RECIPES.filter((r) => r.category === cat)
    const reverse = i % 2 === 1
    const list = items.map((r) => '<li><strong>' + esc(r.title) + '</strong><span>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.time + ' min</span></li>').join('')
    const featuredHere = items.find((r) => r.id === FEATURED_RECIPE.id)
    const link = featuredHere ? '<a href="' + fileRecipe(t) + '">Explore ' + esc(featuredHere.title) + ' &rarr;</a>' : ''
    return '<section class="st-section' + (reverse ? ' st-rev' : '') + '"><div class="st-img" style="background-image:url(' + items[0].image + ')"></div><div class="st-copy"><p class="st-kicker">Chapter ' + (i + 1) + '</p><h2>' + cat + '</h2><ul>' + list + '</ul>' + link + '</div></section>'
  }).join('')
  const css = `
.st-intro{min-height:70vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px 24px}
.st-intro h1{font-size:clamp(2.6rem,7vw,5rem);max-width:800px;line-height:1.05;margin:0}
.st-section{display:grid;grid-template-columns:1fr 1fr;min-height:80vh;align-items:center}
.st-section.st-rev{direction:rtl}
.st-section.st-rev>*{direction:ltr}
.st-img{height:100%;min-height:420px;background-size:cover;background-position:center}
.st-copy{padding:40px clamp(24px,5vw,64px)}
.st-kicker{color:var(--cp-accent);text-transform:uppercase;letter-spacing:.2em;font-size:.75rem;font-weight:700}
.st-copy h2{font-size:3rem;margin:12px 0 24px}
.st-copy ul{list-style:none;padding:0;margin:0 0 20px}
.st-copy li{border-top:1px solid var(--cp-border);padding:14px 0;display:flex;justify-content:space-between;font-size:.9rem}
.st-copy li span{color:var(--cp-text-muted);font-size:.78rem}
.st-copy a{font-weight:700}
@media (max-width:800px){.st-section,.st-section.st-rev{grid-template-columns:1fr;direction:ltr}.st-img{min-height:260px}}
`
  const body = '<div style="display:flex;justify-content:space-between;padding:20px clamp(20px,4vw,56px)"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a></div><div class="st-intro"><h1>Eat with purpose.</h1></div>' + sections
  return page(t, css, body)
}
function storytellingRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.sr-hero{min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px 24px}
.sr-hero h1{font-size:clamp(2.2rem,6vw,4rem);max-width:760px;margin:0 0 16px}
.sr-section{display:grid;grid-template-columns:1fr 1fr;align-items:center;min-height:70vh}
.sr-section.sr-rev{direction:rtl}
.sr-section.sr-rev>*{direction:ltr}
.sr-img{height:100%;min-height:380px;background-size:cover;background-position:center}
.sr-copy{padding:40px clamp(24px,5vw,64px)}
.sr-copy h3{font-size:2rem;margin:0 0 20px}
`
  const body = '<div style="padding:20px clamp(20px,4vw,56px)"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a></div><div class="sr-hero"><div><p style="color:var(--cp-accent);text-transform:uppercase;letter-spacing:.2em;font-size:.8rem;font-weight:700">' + macroRow(r) + '</p><h1>' + esc(r.title) + '</h1><p style="color:var(--cp-text-soft);max-width:520px;margin:0 auto">' + esc(r.description) + '</p></div></div>' +
    '<div class="sr-section"><div class="sr-img" style="background-image:url(' + r.image + ')"></div><div class="sr-copy"><h3>Ingredients</h3><ul style="padding-left:20px;line-height:1.9">' + r.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div></div>' +
    '<div class="sr-section sr-rev"><div class="sr-img" style="background-image:url(' + r.image + ')"></div><div class="sr-copy"><h3>Method</h3><ol style="padding-left:20px;line-height:1.9">' + r.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol><div class="rd-actions"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div></div>' +
    '<div style="text-align:center;padding:40px"><a href="' + fileHome(t) + '">&larr; Back to all chapters</a></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 6 — SPLIT-SCREEN: fixed left image collage, scrolling right recipe list
// ============================================================
function splitHome(t) {
  const filters = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="cat-chip ' + (c === 'All' ? 'active' : '') + '">' + c + '</button>').join('')
  const rows = RECIPES.map((r) => '<a class="sp-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(t) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><div><span>' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + esc(r.description) + '</p><div class="sp-meta">' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.time + ' min</div></div></a>').join('')
  const css = `
.sp-shell{display:grid;grid-template-columns:42% 58%;min-height:100vh}
.sp-left{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.7)),url(${FEATURED_RECIPE.image});background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:40px}
.sp-left h1{font-size:2.6rem;margin:20px 0 10px}
.sp-right{padding:30px clamp(20px,3vw,48px)}
.sp-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;position:sticky;top:0;background:var(--cp-bg);padding:10px 0;z-index:5}
.sp-row{display:flex;gap:18px;text-decoration:none;color:inherit;padding:18px 0;border-bottom:1px solid var(--cp-border)}
.sp-row img{width:140px;height:100px;object-fit:cover;border-radius:10px;flex:0 0 auto}
.sp-row h4{margin:4px 0 6px}
.sp-row p{margin:0 0 8px;color:var(--cp-text-soft);font-size:.85rem}
.sp-meta{font-size:.75rem;color:var(--cp-text-muted)}
.sp-row span{color:var(--cp-accent);font-size:.65rem;text-transform:uppercase;font-weight:700}
@media (max-width:800px){.sp-shell{grid-template-columns:1fr}.sp-left{position:relative;height:50vh}}
`
  const body = '<div class="sp-shell"><div class="sp-left"><a class="brand" href="' + fileHome(t) + '" style="color:#fff"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><div><h1>Eat with purpose.</h1><p>High-protein ideas built for training days.</p></div></div><div class="sp-right"><div class="sp-filters">' + filters + '</div>' + rows + '</div></div>' + catFilterScript()
  return page(t, css, body)
}
function splitRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.sr2-shell{display:grid;grid-template-columns:42% 58%;min-height:100vh}
.sr2-left{position:sticky;top:0;height:100vh;background:url(${r.image});background-size:cover;background-position:center}
.sr2-right{padding:40px clamp(20px,3vw,48px)}
.sr2-right a.back{font-size:.85rem;color:var(--cp-text-muted)}
.sr2-right h1{font-size:2.2rem;margin:16px 0}
@media (max-width:800px){.sr2-shell{grid-template-columns:1fr}.sr2-left{position:relative;height:40vh}}
`
  const body = '<div class="sr2-shell"><div class="sr2-left"></div><div class="sr2-right"><a class="back" href="' + fileHome(t) + '">&larr; Back to all recipes</a><h1>' + esc(r.title) + '</h1><p style="color:var(--cp-text-soft)">' + esc(r.description) + '</p><div style="display:flex;gap:16px;margin:16px 0;font-size:.85rem">' + macroRow(r) + '</div>' + ingredientsMethod(r) + '<div class="rd-actions" style="margin-top:20px"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 7 — FILMSTRIP: category tabs + full-height horizontal scroll-snap filmstrip
// ============================================================
function filmstripHome(t) {
  const tabs = CATEGORIES.map((c, i) => '<button data-filmtab="' + c + '" class="cat-chip ' + (i === 0 ? 'active' : '') + '">' + c + '</button>').join('')
  const strips = CATEGORIES.map((cat, i) => {
    const items = RECIPES.filter((r) => r.category === cat)
    const panels = items.map((r) => '<div class="fs-panel" style="background-image:url(' + r.image + ')"><div class="fs-fade"></div><h2>' + esc(r.title) + '</h2><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.time + ' min</p>' + (r.id === FEATURED_RECIPE.id ? '<a href="' + fileRecipe(t) + '">View recipe &rarr;</a>' : '') + '</div>').join('')
    return '<div class="fs-strip" data-filmpanel="' + cat + '" style="' + (i === 0 ? '' : 'display:none') + '">' + panels + '</div>'
  }).join('')
  const css = `
.fs-top{display:flex;justify-content:space-between;align-items:center;padding:20px clamp(20px,4vw,48px)}
.fs-tabs{display:flex;gap:8px}
.fs-strip{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;height:78vh;padding:0 clamp(20px,4vw,48px) 20px}
.fs-panel{flex:0 0 70vw;max-width:600px;scroll-snap-align:start;border-radius:16px;background-size:cover;background-position:center;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;color:#fff;overflow:hidden}
.fs-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75),transparent 55%)}
.fs-panel h2,.fs-panel p,.fs-panel a{position:relative;margin:0}
.fs-panel h2{font-size:1.8rem}
.fs-panel p{opacity:.85;margin-top:8px}
.fs-panel a{color:#fff;font-weight:700;margin-top:14px;display:inline-block}
@media (max-width:700px){.fs-panel{flex-basis:85vw}}
`
  const script = `<script>
document.querySelectorAll('[data-filmtab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filmtab]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('[data-filmpanel]').forEach((s) => { s.style.display = s.dataset.filmpanel === btn.dataset.filmtab ? 'flex' : 'none'; });
  });
});
</script>`
  const body = '<div class="fs-top"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><div class="fs-tabs">' + tabs + '</div></div>' + strips + script
  return page(t, css, body)
}
function filmstripRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.fr-top{display:flex;justify-content:space-between;padding:20px clamp(20px,4vw,48px)}
.fr-strip{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;height:82vh}
.fr-panel{flex:0 0 100vw;scroll-snap-align:start;padding:40px clamp(20px,5vw,60px);display:flex;flex-direction:column;justify-content:center}
.fr-panel.fr-hero{background-size:cover;background-position:center;color:#fff;background-image:url(${r.image})}
.fr-panel h2{font-size:2rem;margin-bottom:20px}
.fr-dots{display:flex;gap:8px;justify-content:center;padding:16px}
.fr-dots span{width:8px;height:8px;border-radius:50%;background:var(--cp-border)}
`
  const body = '<div class="fr-top"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><a href="' + fileHome(t) + '">&larr; Back</a></div><div class="fr-strip"><div class="fr-panel fr-hero"><h2>' + esc(r.title) + '</h2><p>' + esc(r.description) + '</p><div style="margin-top:16px">' + macroRow(r) + '</div></div><div class="fr-panel"><h2>Ingredients</h2><ul style="padding-left:20px;line-height:1.9">' + r.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div><div class="fr-panel"><h2>Method</h2><ol style="padding-left:20px;line-height:1.9">' + r.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol></div><div class="fr-panel"><h2>Save this recipe</h2><div class="rd-actions"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div></div><div class="fr-dots"><span></span><span></span><span></span><span></span></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 8 — CARDLESS: full-width photographic bands, no boxes, alternating alignment
// ============================================================
function cardlessHome(t) {
  const anchors = CATEGORIES.map((c) => '<a href="#cat-' + c + '">' + c + '</a>').join('')
  const bands = RECIPES.map((r, i) => {
    const first = RECIPES.findIndex((x) => x.category === r.category) === i
    return '<section class="cl-band" ' + (first ? 'id="cat-' + r.category + '"' : '') + ' style="background-image:url(' + r.image + ')"><div class="cl-scrim"></div><div class="cl-text ' + (i % 2 ? 'cl-right' : '') + '"><span>' + r.category + '</span><h2>' + esc(r.title) + '</h2><p>' + esc(r.description) + '</p><div class="cl-meta">' + r.calories + ' kcal &middot; ' + r.protein + 'g protein &middot; ' + r.time + ' min</div>' + (r.id === FEATURED_RECIPE.id ? '<a href="' + fileRecipe(t) + '">Read recipe &rarr;</a>' : '') + '</div></section>'
  }).join('')
  const css = `
.cl-nav{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;padding:18px clamp(20px,4vw,48px);background:var(--cp-overlay,rgba(0,0,0,.4));backdrop-filter:blur(6px);color:#fff}
.cl-nav a{color:#fff;margin-left:16px;font-size:.85rem;text-decoration:none}
.cl-band{min-height:88vh;background-size:cover;background-position:center;position:relative;display:flex;align-items:center}
.cl-scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.6),transparent 60%)}
.cl-text{position:relative;color:#fff;max-width:520px;padding:0 clamp(24px,6vw,80px)}
.cl-text.cl-right{margin-left:auto;text-align:right}
.cl-text span{color:var(--cp-accent);text-transform:uppercase;font-size:.75rem;font-weight:700;letter-spacing:.15em}
.cl-text h2{font-size:clamp(2rem,4vw,3rem);margin:12px 0}
.cl-meta{font-size:.85rem;opacity:.85;margin:14px 0}
.cl-text a{color:#fff;font-weight:700}
`
  const body = '<div class="cl-nav"><a class="brand" href="' + fileHome(t) + '" style="color:#fff"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><div>' + anchors + '</div></div>' + bands
  return page(t, css, body)
}
function cardlessRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.cx-hero{min-height:80vh;background-size:cover;background-position:center;position:relative;display:flex;align-items:flex-end;background-image:url(${r.image})}
.cx-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75),transparent 60%)}
.cx-hero-text{position:relative;color:#fff;padding:0 clamp(24px,6vw,80px) 60px}
.cx-hero-text h1{font-size:clamp(2.2rem,5vw,4rem);margin:0 0 12px}
.cx-body{max-width:720px;margin:0 auto;padding:50px 24px}
.cx-body h3{font-size:1rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cp-accent);margin:0 0 16px}
.cx-body ul,.cx-body ol{line-height:2;font-size:1rem}
.cx-nav{position:absolute;top:0;left:0;right:0;padding:20px clamp(20px,4vw,48px);display:flex;justify-content:space-between;z-index:2}
.cx-nav a{color:#fff}
`
  const body = '<div class="cx-hero"><div class="cx-nav"><a class="brand" href="' + fileHome(t) + '" style="color:#fff"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><a href="' + fileHome(t) + '">&larr; Back</a></div><div class="cx-scrim"></div><div class="cx-hero-text"><h1>' + esc(r.title) + '</h1><p>' + macroRow(r) + '</p></div></div><div class="cx-body"><h3>Ingredients</h3><ul style="list-style:none;padding:0">' + r.ingredients.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul><h3 style="margin-top:40px">Method</h3><ol style="padding-left:20px">' + r.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol><div class="rd-actions" style="margin-top:30px"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 9 — COLLAGE HERO: wild overlapping-photo hero + calm uniform grid below
// ============================================================
function collageHome(t) {
  const collageImgs = RECIPES.slice(0, 4)
  const collage = collageImgs.map((r, i) => '<img class="cg-photo cg-p' + i + '" src="' + r.image + '" alt="">').join('')
  const grid = RECIPES.map((r) => '<a class="cg-card" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(t) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><div><span>' + r.category + '</span><h4>' + esc(r.title) + '</h4><p>' + r.calories + ' kcal &middot; ' + r.protein + 'g protein</p></div></a>').join('')
  const filters = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="cat-chip ' + (c === 'All' ? 'active' : '') + '">' + c + '</button>').join('')
  const css = `
.cg-nav{display:flex;justify-content:space-between;padding:20px clamp(20px,4vw,48px);position:relative;z-index:3}
.cg-hero{position:relative;min-height:70vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.cg-photo{position:absolute;object-fit:cover;border-radius:10px;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.cg-p0{width:280px;height:200px;top:8%;left:6%;transform:rotate(-8deg)}
.cg-p1{width:220px;height:280px;top:15%;right:8%;transform:rotate(6deg)}
.cg-p2{width:240px;height:180px;bottom:6%;left:14%;transform:rotate(5deg)}
.cg-p3{width:260px;height:200px;bottom:4%;right:12%;transform:rotate(-5deg)}
.cg-title{position:relative;z-index:2;text-align:center;background:var(--cp-bg);padding:24px 40px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.2)}
.cg-title h1{font-size:clamp(2rem,5vw,3.4rem);margin:0}
.cg-filters{display:flex;gap:8px;justify-content:center;padding:30px;flex-wrap:wrap}
.cg-grid{max-width:1100px;margin:0 auto;padding:0 24px 60px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.cg-card{text-decoration:none;color:inherit;border:1px solid var(--cp-border);border-radius:10px;overflow:hidden}
.cg-card img{height:120px;width:100%;object-fit:cover}
.cg-card div{padding:10px}
.cg-card span{color:var(--cp-accent);font-size:.6rem;text-transform:uppercase;font-weight:700}
.cg-card h4{margin:6px 0 4px;font-size:.9rem}
.cg-card p{margin:0;font-size:.7rem;color:var(--cp-text-muted)}
@media (max-width:800px){.cg-photo{display:none}.cg-grid{grid-template-columns:repeat(2,1fr)}}
`
  const body = '<div class="cg-nav"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a></div><div class="cg-hero">' + collage + '<div class="cg-title"><h1>Eat with purpose.</h1></div></div><div class="cg-filters">' + filters + '</div><div class="cg-grid">' + grid + '</div>' + catFilterScript()
  return page(t, css, body)
}
function collageRecipe(t) {
  const r = FEATURED_RECIPE
  const other = RECIPES[1]
  const css = `
.cq-nav{display:flex;justify-content:space-between;padding:20px clamp(20px,4vw,48px)}
.cq-hero{position:relative;min-height:50vh;display:flex;align-items:center;justify-content:center}
.cq-photo{position:absolute;object-fit:cover;border-radius:10px;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.cq-p0{width:340px;height:240px;top:10%;left:10%;transform:rotate(-6deg)}
.cq-p1{width:220px;height:220px;bottom:6%;right:10%;transform:rotate(7deg)}
.cq-title{position:relative;z-index:2;text-align:center;background:var(--cp-bg);padding:20px 36px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.cq-body{max-width:720px;margin:0 auto;padding:40px 24px 70px}
.cq-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin:30px 0}
`
  const body = '<div class="cq-nav"><a class="brand" href="' + fileHome(t) + '"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a><a href="' + fileHome(t) + '">&larr; Back</a></div><div class="cq-hero"><img class="cq-photo cq-p0" src="' + r.image + '"><img class="cq-photo cq-p1" src="' + other.image + '"><div class="cq-title"><h1 style="margin:0">' + esc(r.title) + '</h1></div></div><div class="cq-body"><p style="color:var(--cp-text-soft)">' + esc(r.description) + '</p><div style="display:flex;gap:16px;margin:16px 0;font-size:.85rem">' + macroRow(r) + '</div><div class="cq-grid">' + ingredientsMethod(r) + '</div><div class="rd-actions"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div>'
  return page(t, css, body, fileHome(t))
}

// ============================================================
// LAYOUT 10 — DENSE GRID: sidebar category nav + compact high-density recipe rows
// ============================================================
function denseHome(t) {
  const sidebarLinks = ['All', ...CATEGORIES].map((c) => '<button data-filter="' + c + '" class="dg-link ' + (c === 'All' ? 'active' : '') + '">' + c + '<span>' + (c === 'All' ? RECIPES.length : RECIPES.filter((r) => r.category === c).length) + '</span></button>').join('')
  const rows = RECIPES.map((r) => '<a class="dg-row" href="' + (r.id === FEATURED_RECIPE.id ? fileRecipe(t) : '#') + '" data-cat="' + r.category + '"><img src="' + r.image + '" alt=""><span class="dg-name">' + esc(r.title) + '</span><span class="dg-cat">' + r.category + '</span><span>' + r.calories + ' kcal</span><span>' + r.protein + 'g protein</span><span>' + r.carbs + 'g carbs</span><span>' + r.time + ' min</span></a>').join('')
  const css = `
.dg-shell{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
.dg-side{border-right:1px solid var(--cp-border);padding:24px 16px}
.dg-link{display:flex;justify-content:space-between;width:100%;background:transparent;border:0;color:var(--cp-text-muted);padding:10px 8px;font-size:.85rem;border-radius:6px}
.dg-link.active{background:var(--cp-accent-soft);color:var(--cp-accent);font-weight:700}
.dg-main{padding:30px clamp(20px,3vw,40px)}
.dg-main h1{font-size:1.6rem;margin:0 0 4px}
.dg-main p{color:var(--cp-text-muted);font-size:.85rem;margin:0 0 20px}
.dg-header-row,.dg-row{display:grid;grid-template-columns:56px 2fr 100px 90px 90px 90px 70px;gap:14px;align-items:center;padding:10px 8px;border-bottom:1px solid var(--cp-border);text-decoration:none;color:inherit;font-size:.82rem}
.dg-header-row{color:var(--cp-text-muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.05em}
.dg-row img{width:56px;height:40px;object-fit:cover;border-radius:6px}
.dg-name{font-weight:650}
.dg-cat{color:var(--cp-accent);font-size:.72rem}
@media (max-width:800px){.dg-shell{grid-template-columns:1fr}.dg-side{display:flex;overflow-x:auto;border-right:0;border-bottom:1px solid var(--cp-border)}.dg-header-row{display:none}.dg-row{grid-template-columns:44px 1fr;grid-template-areas:"img name" "img cat" "img meta"}}
`
  const body = '<div class="dg-shell"><div class="dg-side"><a class="brand" href="' + fileHome(t) + '" style="margin-bottom:20px;display:flex"><span class="brand-mark">&#127859;</span>Dudu\'s Kitchen</a>' + sidebarLinks + '</div><div class="dg-main"><h1>The collection</h1><p>' + RECIPES.length + ' recipes &middot; ' + AVG_PROTEIN + 'g avg protein</p><div class="dg-header-row"><span></span><span>Recipe</span><span>Category</span><span>Calories</span><span>Protein</span><span>Carbs</span><span>Time</span></div>' + rows + '</div></div>' + catFilterScript()
  return page(t, css, body)
}
function denseRecipe(t) {
  const r = FEATURED_RECIPE
  const css = `
.dx-shell{max-width:820px;margin:0 auto;padding:30px 24px 70px}
.dx-shell a.back{font-size:.82rem;color:var(--cp-text-muted)}
.dx-head{display:flex;gap:20px;align-items:center;padding:20px 0;border-bottom:1px solid var(--cp-border)}
.dx-head img{width:120px;height:90px;object-fit:cover;border-radius:8px}
.dx-head h1{margin:0 0 6px;font-size:1.4rem}
.dx-specs{display:flex;gap:20px;font-size:.8rem;color:var(--cp-text-muted);flex-wrap:wrap;padding:14px 0;border-bottom:1px solid var(--cp-border)}
.dx-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;padding:20px 0}
`
  const body = '<div class="dx-shell"><a class="back" href="' + fileHome(t) + '">&larr; Back to list</a><div class="dx-head"><img src="' + r.image + '" alt=""><div><h1>' + esc(r.title) + '</h1><p style="margin:0;color:var(--cp-text-soft);font-size:.85rem">' + esc(r.description) + '</p></div></div><div class="dx-specs">' + macroRow(r) + '</div><div class="dx-grid">' + ingredientsMethod(r) + '</div><div class="rd-actions"><button class="primary">&#9825; Save recipe</button><button>Share</button></div></div>'
  return page(t, css, body, fileHome(t))
}

const RENDERERS = {
  'cinematic-rows': { home: cinematicHome, recipe: cinematicRecipe },
  magazine: { home: magazineHome, recipe: magazineRecipe },
  bento: { home: bentoHome, recipe: bentoRecipe },
  masonry: { home: masonryHome, recipe: masonryRecipe },
  storytelling: { home: storytellingHome, recipe: storytellingRecipe },
  'split-screen': { home: splitHome, recipe: splitRecipe },
  filmstrip: { home: filmstripHome, recipe: filmstripRecipe },
  cardless: { home: cardlessHome, recipe: cardlessRecipe },
  'collage-hero': { home: collageHome, recipe: collageRecipe },
  'dense-grid': { home: denseHome, recipe: denseRecipe },
}

THEMES.forEach((t) => {
  const r = RENDERERS[t.layout]
  writeFileSync(join(OUT_DIR, fileHome(t)), r.home(t), 'utf-8')
  writeFileSync(join(OUT_DIR, fileRecipe(t)), r.recipe(t), 'utf-8')
})

writeFileSync(join(OUT_DIR, 'visions-data.json'), JSON.stringify(THEMES.map((t) => ({ id: t.id, order: t.order, name: t.name, engine: t.layout, accent: t.accent, bg: t.bg, text: t.text, tagline: t.blurb, about: t.blurb })), null, 2), 'utf-8')

console.log('Generated ' + THEMES.length * 2 + ' files (' + THEMES.length + ' themes x home+recipe, ' + LAYOUTS.length + ' layouts) in ' + OUT_DIR)
