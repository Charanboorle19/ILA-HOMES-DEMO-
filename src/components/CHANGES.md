# SK Builders Demo — Change Log

Detailed summary of updates made to the **SK-Builders-Demo** project (rebrand, UI, maps, and interaction flows).

---

## 1. Brand rename: ILA Homes → SK Builders

All user-facing branding was updated from **ILA Homes** / **ILA HOMES** to **SK Builders** / **SK BUILDERS**.

### What changed
- **Page meta**: `index.html` title and description
- **Nav & footer**: brand labels (`SK BUILDERS`)
- **About copy**: company description and aria labels
- **CTAs & contact**: “Talk to SK Builders”, share/enquiry WhatsApp-style messages, mailto links (`hello@skbuilders.example`)
- **Guide / presentation UI**: logos, welcome text, aria labels
- **Testimonials / shortlist**: “SK Builders walked us through…”, “via SK Builders”
- **Package identity**: `package.json` / `package-lock.json` name → `sk-builders-demo`
- **README** heading updated

### Notes
- Internal CSS class names such as `.ila-marker` were left as-is to avoid breaking map marker styling.
- Model asset path was later renamed (see §2).

---

## 2. File renames (ila → sk)

| Old path | New path |
|---|---|
| `src/components/WhyIla.jsx` | `src/components/WhySk.jsx` (export `WhySk`) |
| `src/components/ila_homes_presenter_demo.html` | `src/components/sk_builders_presenter_demo.html` |
| `public/models/ila-guide-v01.glb` | `public/models/sk-guide-v01.glb` |

### Related code updates
- `Character.jsx` and `Scene.jsx` now load `/models/sk-guide-v01.glb`
- Demo HTML root id updated from `#ila-root` → `#sk-root`
- Section id `why-ila` → `why-sk`

---

## 3. Mapbox token configuration

### Problem
`MAPBOX_ACCESS_TOKEN` lived in `src/components/.env.local`. Vite only loads env files from the **project root**, so maps could not read the token.

### Fix
- Moved token to root `.env.local`
- Removed misplaced `src/components/.env.local`
- Existing `vite.config.js` already exposes `MAPBOX_` via `envPrefix`
- Map components already use `import.meta.env.MAPBOX_ACCESS_TOKEN`

### How to run
Restart the Vite server after env changes so the token is picked up (`npm run dev`).

---

## 4. Growth corridors — image cards & View on map

**Section:** South Hyderabad · Growth corridors (`GrowthCorridors.jsx` / `.css`)

### Card redesign
- Each corridor card now uses a location image:
  - South Hyderabad → `south-image.png`
  - Maheshwaram → `Maheshwaram.png`
  - Thukkuguda → `Thukkuguda.png`
  - Mansanpally → `Mansanpally.png`
  - Future City → `Future City.png`
- Card content (number, name, tag) is overlaid **on the image** (same content as before, not name-only)
- Desktop spotlight also shows the selected corridor image

### View on map — responsive behavior
| Viewport | Behavior |
|---|---|
| **Desktop** | “View on map” sits **on the image**, bottom-right, beside the name block |
| **Mobile** | “View on map” restored in the **foot bar under the card** (not on the image) |

---

## 5. Plan your purchase — Select a property

**Section:** Plan your purchase — see size, cost and returns together (`EmiAppreciation.jsx` / `.css`)

### Property picker cards
Each plot is now an image card with **text below the image**:
- Name
- **Size** (kept visible, e.g. `267 sq.yd`)
- Price label

### Images used
1. `src/assets/extra-image-3.png`
2. `src/assets/extra-image-5.png`
3. `src/assets/extra-image-8.png`
4. `src/assets/extra-image-6.png`
5. `src/assets/IMAGE-6-ORG.png`

### Plots & sizes
| Plot | Size | Price |
|---|---|---|
| Plot A12 | 267 sq.yd | ₹52 Lakhs |
| Plot B7 | 200 sq.yd | ₹38 Lakhs |
| Plot C3 | 300 sq.yd | ₹44 Lakhs |
| Kokapet Heights | 240 sq.yd | ₹68 Lakhs |
| Mansanpally Meadows | 220 sq.yd | ₹29 Lakhs |

Selected plot summary also includes size (name · size · location · price).

---

## 6. “Calculate for my budget” — WhatsApp popup

### Behavior
When **Calculate for my budget** is clicked:
1. A modal opens asking for a **10-digit Indian mobile number** (+91)
2. Copy explains that EMI / appreciation details will be sent on **WhatsApp**
3. On valid submit, a confirmation shows the number that will receive details

### New files
- `src/components/WhatsAppBudgetModal.jsx`
- `src/components/WhatsAppBudgetModal.css`

### Wired into
- `EmiAppreciation.jsx` (Plan your purchase CTA)
- `PropertyDetail/PriceEmiFuture.jsx` (property detail affordability CTA)

### Validation
- Digits only, max 10
- Must match `/^[6-9]\d{9}$/`

---

## 7. Find your plot — images & View property

**Section:** Find your plot (`FindYourPlot.jsx` / `.css`)

### Match cards
- Property images from existing layout assets (`propertyLayouts` → `src/assets/about-panel/…`)
- Cards keep the **previous compact size**
- Image is used as the **card background** (not a tall white card with a separate image block)
- Text (index, tag/match %, name, meta, reason, price) sits over a dark gradient on the image

### Navigation
- CTA changed from “View on map” → **View property**
- Uses React Router `Link` to `/properties/{id}`
- IDs align with the property detail catalogue (`singapore-township`, `kokapet-heights`, etc.)

---

## 8. Files touched (high level)

### Branding & rename
- `index.html`, `package.json`, `package-lock.json`, `README.md`
- `Navbar.jsx`, `Footer.jsx`, `FinalCta.jsx`, `AboutVault.jsx`, `GuidePlaceholder.jsx`
- Property detail CTAs / share copy, `ShortlistShare.jsx`, `properties.js`
- `WhySk.jsx`, `sk_builders_presenter_demo.html`, `Character.jsx`, `Scene.jsx`

### Env / maps
- `.env.local` (project root)
- Map usage already via `MAPBOX_ACCESS_TOKEN` + `vite.config.js` `envPrefix`

### UI sections
- `GrowthCorridors.jsx` / `GrowthCorridors.css`
- `EmiAppreciation.jsx` / `EmiAppreciation.css`
- `WhatsAppBudgetModal.jsx` / `WhatsAppBudgetModal.css` *(new)*
- `PropertyDetail/PriceEmiFuture.jsx` / `PriceEmiFuture.css`
- `FindYourPlot.jsx` / `FindYourPlot.css`

---

## 9. How to verify locally

1. Ensure root `.env.local` has `MAPBOX_ACCESS_TOKEN=…`
2. Run `npm run dev`
3. Check:
   - Branding shows **SK Builders** in nav/footer/about
   - Growth corridor cards show images; desktop View on map on image; mobile under card
   - Plan your purchase picker shows images + size under each
   - Calculate for my budget opens WhatsApp mobile popup
   - Find your plot matches show image backgrounds and **View property** opens `/properties/...`

---

*Generated from the SK Builders Demo rebrand and UI update session.*
