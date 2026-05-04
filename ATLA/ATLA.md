# ATLA Portfolio — Claude Code Context File

> This file is the persistent memory for Claude Code working on this project.
> It describes the current state of the portfolio, its structure, goals, and conventions.
> When research findings are approved, they will be appended to the bottom of this file under `## Research Log`.

---

## Project Overview

**Project Name:** ATLA Portfolio
**Purpose:** A personal portfolio website themed around *Avatar: The Last Airbender*, built to be professional enough to support job applications in Computer Science, IT, and AVD (Audio-Visual Design) fields.
**Goal:** Fully published, publicly hostable portfolio that balances creative ATLA theming with professional presentation.

**Current Status:** Partially implemented. Core scene structure and layout are in place. Needs visual polish, stronger ATLA authenticity, and professional content population (name, links, projects, etc.).

---

## File Structure

```
ATLA/
├── index.html      ← Main portfolio file (all scenes)
├── style.css       ← Stylesheet (linked, not yet reviewed)
├── main.js         ← JS for scene transitions and interactions
└── claude.md       ← This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic sections) |
| Styling | CSS3 (custom properties, animations, SVG styling) |
| Fonts | Google Fonts — Cinzel, Cinzel Decorative, Lato, Noto Serif |
| Icons/Art | Inline SVG (hand-crafted elemental symbols) |
| Scripting | Vanilla JavaScript (main.js) |
| Hosting | TBD — candidates: GitHub Pages, Netlify, Vercel |

No frameworks, no build tools — pure HTML/CSS/JS.

---

## Scene Structure (index.html)

The portfolio is built as a series of full-page `<section class="scene">` panels inside a `.scenes-wrap` container. Navigation between scenes is handled by `main.js` with a `#pageWipe` overlay for transitions.

| Scene ID | Theme | Purpose |
|---|---|---|
| `#s-intro` | Four Nations opening | Landing / hero screen with nation corner panels and enter button |
| `#s-nav` | World Map | Parchment-style SVG map used as the main navigation hub |
| *(more scenes)* | Nation-specific | About, Skills, Projects, Contact — each styled to a nation |
| Contact (last scene) | Avatar State | Contact links — email, LinkedIn, GitHub, Instagram |

---

## Design System

### Color Palette (by Nation)

| Nation | Primary Use | Approximate Colors |
|---|---|---|
| Water Tribe | Blues, icy whites | `#c2d4e0`, `#aec4d4`, `#96b0c4` |
| Earth Kingdom | Greens, browns | Earth tones — to be refined |
| Fire Nation | Reds, golds, oranges | Warm reds — to be refined |
| Air Nomads | Oranges, soft yellows | Warm neutrals — to be refined |
| Ocean / Map | Parchment background | `#c2d4e0` ocean fill, parchment mat gradient |

### Typography

| Font | Role |
|---|---|
| Cinzel / Cinzel Decorative | Headings, titles, nation labels |
| Lato | Body text, UI labels |
| Noto Serif | Flavour text, taglines |

### SVG Elemental Symbols

All four nation symbols are hand-coded inline SVG:
- **Water:** Two sinusoidal waves inside a circle
- **Earth:** Three nested diamonds with cardinal dots
- **Fire:** Triple-pronged flame crown
- **Air:** Four-arrow pinwheel with center dot

These symbols are reused across scenes (intro, contact, particles, map markers).

---

## Key HTML Conventions

- Scenes use class `scene` with unique `id` (e.g. `id="s-intro"`)
- Nation color classes: `water-col`, `earth-col`, `fire-col`, `air-col`
- Element symbols use classes: `el-water`, `el-earth`, `el-fire`, `el-air`
- Floating particles use `.ep.ep-w`, `.ep.ep-e`, `.ep.ep-f`, `.ep.ep-a`
- Page transitions use `#pageWipe` overlay (controlled via `main.js`)
- Back navigation links use class `.back-link`

---

## Placeholders Still Needing Real Content

- `YOUR NAME` → actual name
- `Software Engineer & CS Student` → actual role/tagline
- `your@email.com` → real email
- `linkedin.com/in/yourprofile` → real LinkedIn
- `github.com/yourgithub` → real GitHub
- `@yourig` → real Instagram/handle
- `@YOUR_HANDLE` → real handle
- Project cards → real projects with descriptions

---

## Improvement Goals

1. **More ATLA-authentic visuals** — colours, textures, and motifs that feel true to the show
2. **Professional polish** — typography hierarchy, spacing, and layout refinement
3. **Hosting** — deploy to a public URL (GitHub Pages is the simplest path for a static site)
4. **Performance** — ensure animations don't hurt load time or accessibility
5. **Responsiveness** — verify mobile layout across breakpoints
6. **Content** — populate all placeholder fields with real personal info

---

## Research Log

*Research findings will be appended here as separate entries once approved. Each entry includes a topic, findings, and implementation notes for Claude Code.*

<!-- RESEARCH ENTRIES GO BELOW THIS LINE -->

---

## Research Entry #1 — 60-30-10 Color Rule by Nation

**Date:** 2026-04-18
**Topic:** ATLA-accurate color palettes per nation, mapped to the 60-30-10 design rule
**Source:** Anime Superhero color analysis (Parts 1 & 2), color-hex.com community palettes, Avatar Fandom wiki

### What is 60-30-10?
A design rule where:
- **60%** = dominant color — backgrounds, large fills, environment
- **30%** = secondary color — surfaces, panels, costumes, cards
- **10%** = accent color — buttons, glows, hover states, icons, borders

Applied to this portfolio: each nation-themed scene should follow its own 60-30-10 breakdown using the colors below.

---

### 🌊 Water Tribe

| Role | Description | Hex |
|---|---|---|
| **60% — Dominant** | Deep arctic blue — ocean, ice walls, night sky | `#1a3a5c` |
| **30% — Secondary** | Mid blue / white fur — parkas, robes, igloo interiors | `#4a7fa5` / `#e8f4f8` |
| **10% — Accent** | Silver-white / pale purple (royalty) — moon spirit, crystal highlights | `#c8dce8` / `#9b7bb5` |

**Reference scene:** *"The Siege of the North"* — ice environment is 60% deep blue, costumes are 30% mid-blue, glowing white moon spirit is the 10% accent. Near-perfect 60-30-10 in the show.

**CSS implementation:**
```css
/* Water Tribe scene */
--water-dominant: #1a3a5c;
--water-secondary: #4a7fa5;
--water-secondary-alt: #e8f4f8;
--water-accent: #c8dce8;
--water-accent-royal: #9b7bb5;
```

---

### 🪨 Earth Kingdom

| Role | Description | Hex |
|---|---|---|
| **60% — Dominant** | Earthy olive/forest green — Ba Sing Se walls, terrain, soldier uniforms | `#4a6741` / `#2d4a1e` |
| **30% — Secondary** | Warm yellow-brown / tan — merchant clothing, Toph's robes, arena floors | `#b8a830` / `#8a7a3c` |
| **10% — Accent** | Pale yellow-gold — lanterns, headbands, palace trim | `#d7d85a` |

**Reference scene:** *"The Blind Bandit"* — stone arena is 60% brown-green, Toph's outfit is 30% muted yellow-green, arena lights and gold accents are the 10%.

**CSS implementation:**
```css
/* Earth Kingdom scene */
--earth-dominant: #4a6741;
--earth-dominant-dark: #2d4a1e;
--earth-secondary: #b8a830;
--earth-secondary-alt: #8a7a3c;
--earth-accent: #d7d85a;
```

---

### 🔥 Fire Nation

| Role | Description | Hex |
|---|---|---|
| **60% — Dominant** | Deep crimson / burnt red — ships, palace walls, armor, volcanic landscape | `#8b1a1a` / `#6e1700` |
| **30% — Secondary** | Scorched brown / dark wood — everyday robes, ship decking, Zuko's casual wear | `#785e3c` / `#5c3026` |
| **10% — Accent** | Gold / amber flame — royal insignia, throne flames, Agni Kai glow, crown | `#ecb100` / `#c9720a` |

**Reference scene:** *"The Avatar and the Firelord"* — throne room is 60% deep crimson and black, robes are 30% dark brown-red, throne flames and gold crown are the 10% accent.

**CSS implementation:**
```css
/* Fire Nation scene */
--fire-dominant: #8b1a1a;
--fire-dominant-dark: #6e1700;
--fire-secondary: #785e3c;
--fire-secondary-alt: #5c3026;
--fire-accent: #ecb100;
--fire-accent-flame: #c9720a;
```

---

### 🌬️ Air Nomads

| Role | Description | Hex |
|---|---|---|
| **60% — Dominant** | Warm saffron orange — temple architecture, Aang's outer robe, monk attire | `#e8761a` / `#dc8c24` |
| **30% — Secondary** | Pale golden yellow — inner robes, temple banners, sky backgrounds | `#f4c430` / `#fcdc7b` |
| **10% — Accent** | Soft grey / sky blue-grey — Air Nomad symbol, tattoo glow, temple roof detail | `#aaaaaa` / `#7094b7` |

**Reference scene:** *"The Southern Air Temple"* flashback — warm orange stone dominates (60%), golden courtyard light fills (30%), blue sky and Aang's glowing blue arrow tattoos are the 10% contrast.

**CSS implementation:**
```css
/* Air Nomads scene */
--air-dominant: #e8761a;
--air-dominant-alt: #dc8c24;
--air-secondary: #f4c430;
--air-secondary-light: #fcdc7b;
--air-accent: #aaaaaa;
--air-accent-blue: #7094b7;
```

---

### Implementation Notes for Claude Code

- Apply the **60% dominant** color as the `background-color` or large SVG fill of each nation scene
- Apply the **30% secondary** color to card backgrounds, panel fills, and text container surfaces
- Apply the **10% accent** color to buttons, hover states, glows, border highlights, and icon fills
- The existing Design System color table above (Water Tribe row) already uses approximate values — these research-verified hex codes should **replace** the approximate ones in `style.css`
- Nation CSS classes (`water-col`, `earth-col`, `fire-col`, `air-col`) should pull from these variables
- Avoid using accent colors at large scale — overuse kills the contrast effect that makes ATLA scenes feel punchy
