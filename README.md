# 👑 ₹upi Wedding Invitation Details Portal

> **A luxury Indian wedding digital experience built with love for Rupa (₹upi) ❤️**  
> Gathers every intricate wedding detail in one serene, royal, and sacred space — free from endless WhatsApp chains, spelling mistakes, or date confusions.

---

![₹upi Wedding Invitation Banner](/public/og-image.jpg)

## 🪔 Vision & Core Philosophy

Instead of overwhelming the bride with fragmented calls and text messages asking for family names, grandfather honorifics, ceremony dates, and venue directions, this dedicated, mobile-first web app gives her a peaceful space to enter her wedding details at her own pace.

- **Royal Aesthetic**: Designed to feel like receiving a physical, bespoke Indian royal wedding card — complete with rich burgundy silks (`#7A1526`), deep velvet maroon (`#4A020F`), shimmering gold foil (`#D4AF37`), handmade silk ivory parchment (`#FFFDF8`), and sacred Sanskrit shlokas (`॥ श्री गणेशाय नमः ॥`).
- **Zero Data Loss**: Every keystroke automatically persists to local draft storage (`localStorage`). She can close her browser anytime and resume exactly where she left off.
- **Live Card Simulation**: Real-time photorealistic preview of the printed card layout, allowing the family to see how the names and functions harmonize before submitting.
- **Ambient Melody Player**: Relaxing acoustic background melody (*Lemon Tree*) to make the experience joyful and celebratory.
- **Smart Autofill**: Instant venue copying (*"Same as Home Address"* / *"Same as Wedding Venue"*) to eliminate typing repetitive addresses.
- **Protected Admin Portal**: Secured with `ADMIN_SECRET` passcode, offering one-click formatted card exports for printing vendors, CSV/JSON downloads, and click-to-call links.

---

## 🌺 Interactive Features & Modules

### 1. 10-Step Royal Questionnaire Wizard
1. **Royal Welcome**: Personalized greeting for ₹upi with reassurance that progress is auto-saved.
2. **"A Cordial Invitation From"**: Father & Mother's prefixes (`Sh.` / `Late Sh.`, `Smt.` / `Late Smt.`) and names, family residence address, and primary/secondary phone numbers with phone dialer input types.
3. **Divine Blessings & Elders**: Grandmother (`Dadi Ji`) and Grandfather (`Dada Ji`) names with respectful honorifics.
4. **The Bride**: Pre-filled formal name *"Rupa"* and affectionate pet name / monogram *"₹upi"*.
5. **The Groom & His Family**: Groom's full name and parents' formal names.
6. **Auspicious Dates & Times**: Custom royal Panchang calendar selector for Wedding, Haldi, and Mehndi ceremonies.
7. **Venues & Locations**: Default venue at *Kisan Bhawan, Sector 16, Faridabad* with Google Maps pin link, plus smart 1-click address autofill for Haldi & Mehndi.
8. **R.S.V.P. Contacts**: Dynamic list of family representatives and contact numbers.
9. **"With Best Compliments From"**: Dynamic list of well-wishers, family branches, and relatives.
10. **Review, Live Simulation & Submission**: Accordion review cards with 1-click step jumps, full live card simulation, special shloka/printing notes textarea, and celebration confetti on submission.

### 2. Custom Royal Date Picker (`RoyalDatePicker.tsx`)
- Elegant modal dialog replacing clumsy OS browser inputs.
- Quick auspicious season presets (*Nov 2026, Dec 2026, Jan 2027, Today*).
- Month and year navigation dropdowns (2025–2028).
- Day-of-week indications and weekend wedding highlights.

### 3. Ambient Music Player (`MusicPlayer.tsx`)
- Floating musical badge with animated gold sound wave equalizer.
- Audio playback of `/lemon_tree.m4a` with user consent prompt, play/pause toggle, mute/unmute, and collapsible controls.

### 4. Live Wedding Card Simulation (`LiveCardPreview.tsx`)
- Gilded double borders with traditional corner flourishes.
- Sacred Ganesh shlokas in classic calligraphy.
- Realistic ivory paper texture with gold foil stamping look.
- **"Copy Card Wording"** button to copy formatted text ready to send directly to graphic designers or printing presses.

### 5. Protected Admin Dashboard (`/admin`)
- Passcode gate with `ADMIN_SECRET`.
- Chronologically sorted submissions with status indicators.
- **1-Click Copy Wording for Printing Press**.
- **Download CSV** spreadsheet for vendors.
- **Download JSON** for raw data backups.
- Direct phone call links (`tel:`) and Google Maps directions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 + Bespoke Royal Indian Design Tokens |
| **Database** | Serverless PostgreSQL via `@neondatabase/serverless` |
| **Audio** | HTML5 Web Audio API / Custom React Controller |
| **Icons & Motifs** | Inline Indian SVGs & Unicode Auspicious Symbols |
| **Fonts** | Google Fonts: *Cinzel*, *Playfair Display*, *Cormorant Garamond*, *Outfit*, *Great Vibes* |
| **Hosting** | Cloudflare Pages / Vercel |

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/raj0072me/rupi-wedding-invitation.git
cd rupi-wedding-invitation
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
# Neon Serverless PostgreSQL connection string
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Admin Dashboard Passcode
ADMIN_SECRET="9899654695"

# Canonical URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Architecture

The application connects to a Neon serverless PostgreSQL database. It automatically boots the schema on first request:

```sql
CREATE TABLE IF NOT EXISTS wedding_submissions (
  id                      SERIAL PRIMARY KEY,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status                  TEXT DEFAULT 'submitted' NOT NULL,

  -- Family
  father_prefix           TEXT DEFAULT 'Sh.' NOT NULL,
  father_name             TEXT NOT NULL DEFAULT '',
  mother_prefix           TEXT DEFAULT 'Smt.' NOT NULL,
  mother_name             TEXT NOT NULL DEFAULT '',
  family_address          TEXT DEFAULT '',
  mobile_1                TEXT DEFAULT '',
  mobile_2                TEXT DEFAULT '',

  -- Ancestors
  grandmother_name        TEXT DEFAULT '',
  grandfather_name        TEXT DEFAULT '',

  -- Bride
  bride_name              TEXT NOT NULL DEFAULT '',
  bride_initials          TEXT DEFAULT '',

  -- Groom
  groom_name              TEXT NOT NULL DEFAULT '',
  groom_mother_prefix     TEXT DEFAULT 'Smt.',
  groom_mother_name       TEXT DEFAULT '',
  groom_father_prefix     TEXT DEFAULT 'Sh.',
  groom_father_name       TEXT DEFAULT '',

  -- Auspicious Dates
  wedding_date            DATE,
  haldi_date              DATE,
  haldi_venue             TEXT DEFAULT '',
  mehndi_date             DATE,
  mehndi_venue            TEXT DEFAULT '',

  -- Reception Venue
  wedding_reception_venue TEXT DEFAULT 'Kisan Bhawan, Sector 16, Faridabad, Haryana 121002',
  wedding_map_url         TEXT DEFAULT 'https://maps.app.goo.gl/UzVhUn48VhkQPS88A',

  -- Dynamic Lists
  rsvp_names              JSONB DEFAULT '[]'::jsonb,
  best_compliments        JSONB DEFAULT '[]'::jsonb,

  -- Special Notes
  additional_notes        TEXT DEFAULT '',
  submission_source       TEXT DEFAULT 'web'
);

CREATE INDEX IF NOT EXISTS idx_wedding_submissions_created_at
ON wedding_submissions(created_at DESC);
```

---

## 🌐 Deployment Guides

### Option A: Netlify Deployment
This project includes pre-configured [`netlify.toml`](file:///c:/Users/raj00/OneDrive/Desktop/temp_apps/rupi_wedding_invitation_form/netlify.toml) and `.node-version` (Node 22):
1. Connect your repository `raj0072me/rupi-wedding-invitation` in [Netlify Dashboard](https://app.netlify.com).
2. Netlify will automatically detect:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Runtime plugin**: `@netlify/plugin-nextjs`
3. In **Site Configuration** → **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `ADMIN_SECRET`: Your secret admin passcode (`9899654695`)
4. **No badges/widgets**: Netlify drawer & preview badges are explicitly disabled via `DISABLE_NETLIFY_DRAWER = "true"`.

### Option B: Cloudflare Pages Deployment
1. Connect repo in [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. **Build settings**:
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Output directory: `.next`
3. **Environment variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `ADMIN_SECRET`: Your secret admin passcode (`9899654695`)
   - `NODE_VERSION`: `20` or `22`
4. Click **Save and Deploy**. Live at `https://rupi-wedding-invitation.pages.dev`!

---

## 💖 Made with Love
Created for **Rupa (₹upi)**. May this union be blessed with eternal happiness, laughter, health, and prosperity.
