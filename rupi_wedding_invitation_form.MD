# Master Specification & Prompt: ₹upi Wedding Invitation Details Web App

> **Prompt Role & Persona**: You are an elite Full-Stack Web Architect and UI/UX Designer specializing in luxury Indian wedding digital experiences, Next.js App Router, TypeScript, Tailwind CSS, and Serverless PostgreSQL. Your mission is to build the complete, production-ready web application specified below from scratch.

---

## 1. Project Background & Vision

This application is built for a bride named **Rupa** (affectionately called **₹upi**). 

Instead of overwhelming her with endless WhatsApp messages and fragmented phone calls asking for wedding invitation details (which risks typos in elder names, wrong dates, or incorrect venues), this dedicated, mobile-first web app gives her a peaceful, joyful, and sacred space to input every detail at her own pace.

### Core Philosophy & Quality Bar
- **Never look like an administrative form or a generic SaaS dashboard.**
- Feel like receiving a **physical royal Indian wedding invitation card** made of handmade ivory paper with gold foil stamping, deep maroon silks, marigold blossoms, and mehndi motifs.
- **Flawless Mobile Experience**: Touch targets must be generous, text crystal clear, and navigation intuitive for someone filling this out on a smartphone.
- **Zero Data Loss**: Every keystroke must automatically persist in local draft storage so she can close her browser and resume anytime without losing progress.

---

## 2. Environment Variables & Configuration Settings

The application relies on server-side environment variables to ensure zero credential leakage to client browsers.

### Required `.env` File Specification
Create a `.env` file in the root directory with the following variables:

```env
# ==============================================================================
# Database Configuration (Neon Serverless PostgreSQL)
# ==============================================================================
# Connection string with SSL enabled and connection pooler support.
# Never expose this variable with NEXT_PUBLIC_ prefix.
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# ==============================================================================
# Admin Dashboard Authentication Secret
# ==============================================================================
# Secret passcode or alphanumeric key used to authorize access to the /admin 
# view and API endpoints. Can be a 32-byte hex string or secure personal PIN.
ADMIN_SECRET="your-admin-passcode"

# ==============================================================================
# Application URL & SEO Metadata
# ==============================================================================
# Base URL of the live deployment used for Open Graph tags, canonical URLs,
# and WhatsApp preview card link resolution.
NEXT_PUBLIC_BASE_URL="https://your-domain-name.com"

# ==============================================================================
# Optional Runtime Flags
# ==============================================================================
# Node environment mode
NODE_ENV="production"
```

### Environment Security & Handling Rules
1. **Client Isolation**: Only variables explicitly prefixed with `NEXT_PUBLIC_` may be bundled to the browser. `DATABASE_URL` and `ADMIN_SECRET` must strictly remain on the server side.
2. **Serverless Connection Pooling**: The database driver (`@neondatabase/serverless`) connects over HTTPS/WebSockets; ensure pooler endpoints are used so connections scale seamlessly without running out of connection limits.
3. **Build-Time Resilience**: If `DATABASE_URL` is evaluated during static route analysis, ensure the database initialization and query runners instantiate lazily on request execution rather than during static module import time.
4. **Admin Protection**: Requests to `/api/admin` must validate the `ADMIN_SECRET` via HTTP Authorization header (`Bearer <secret>`) or query parameter before returning any collected family details.

---

## 3. Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Actions / Route Handlers)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS with custom CSS design tokens and Google Fonts
- **Database**: Serverless PostgreSQL via `@neondatabase/serverless`
- **Audio Engine**: HTML5 Web Audio API / Custom React Audio Player
- **Icons & Graphics**: Inline SVG Indian motifs (Diyas, Mandalas, Kalash, Marigolds)
- **Visual Assets**: `public/rupi.png` used for custom crest, favicon, and Apple Touch Icon

---

## 4. Database Schema & Architecture

The application requires a PostgreSQL table named `wedding_submissions`. The database connection layer must automatically create the table and indices if they do not exist (`initDb()` function).

### SQL DDL Definition
```sql
CREATE TABLE IF NOT EXISTS wedding_submissions (
  id                      SERIAL PRIMARY KEY,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status                  TEXT DEFAULT 'submitted' NOT NULL,

  -- Family / "A Cordial Invitation From"
  father_prefix           TEXT DEFAULT 'Sh.' NOT NULL,
  father_name             TEXT NOT NULL DEFAULT '',
  mother_prefix           TEXT DEFAULT 'Smt.' NOT NULL,
  mother_name             TEXT NOT NULL DEFAULT '',
  family_address          TEXT DEFAULT '',
  mobile_1                TEXT DEFAULT '',
  mobile_2                TEXT DEFAULT '',

  -- Blessings & Ancestors
  grandmother_name        TEXT DEFAULT '',
  grandfather_name        TEXT DEFAULT '',

  -- Bride Details
  bride_name              TEXT NOT NULL DEFAULT '',
  bride_initials          TEXT DEFAULT '',

  -- Groom Details
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

  -- Wedding & Reception Venue
  wedding_reception_venue TEXT DEFAULT 'Kisan Bhawan, Sector 16, Faridabad, Haryana 121002',
  wedding_map_url         TEXT DEFAULT 'https://maps.app.goo.gl/UzVhUn48VhkQPS88A',

  -- Dynamic Lists (Stored as JSONB)
  rsvp_names              JSONB DEFAULT '[]'::jsonb,
  best_compliments        JSONB DEFAULT '[]'::jsonb,

  -- Additional Notes & Customization
  additional_notes        TEXT DEFAULT '',

  -- Metadata
  submission_source       TEXT DEFAULT 'web'
);

-- Index for instant chronological sorting in admin portal
CREATE INDEX IF NOT EXISTS idx_wedding_submissions_created_at
ON wedding_submissions(created_at DESC);
```

---

## 5. Visual Design System & Aesthetics

### Color Palette (Royal Indian Heritage)
- **Royal Burgundy / Crimson Wine**: `#7A1526` and `#5C0612` (Headings, primary buttons, borders)
- **Deep Velvet Maroon**: `#4A020F` (Card backgrounds in dark accents)
- **Royal Wedding Gold**: `#D4AF37`, `#B38F26`, `#F3E5AB` (Accents, dividers, badges, icons)
- **Warm Silk Ivory / Cream**: `#FFFDF8`, `#FAF5EC`, `#F5EBE1` (Page backgrounds, card fills)
- **Haldi Marigold Yellow**: `#F59E0B`, `#D97706` (Haldi event highlights)
- **Mehndi Henna Green**: `#2D5A27`, `#1E3F1A` (Mehndi ceremony highlights)
- **Charcoal Ink**: `#1F2937`, `#374151` (High-contrast, legible typography)

### Typography Hierarchy
- **Royal Display**: `Cinzel`, `Playfair Display`, or `Cormorant Garamond` for titles, headers, and quote highlights.
- **Body & Inputs**: `Outfit`, `Plus Jakarta Sans`, or `Inter` for ultra-clean readability on mobile screens.
- **Font Sizes**: Minimum input label font size `14px`, input text `16px` (prevents iOS Safari auto-zoom on focus).

### Decorative Indian Elements
- **Mandala Background Watermarks**: Low-opacity rotating gold geometric mandalas.
- **Floral Garlands & Torans**: Delicate marigold and mango-leaf SVG headers.
- **Golden Diyas & Sparkles**: Warm glowing micro-animations on interactive cards.
- **Card Styling**: Rounded corners (`1.25rem`), subtle gold double-borders, warm drop shadows (`rgba(122, 21, 38, 0.08)`).

think and do better design 

---

## 6. Detailed Step-by-Step Questionnaire Flow

The application must be organized into 10 cohesive steps with smooth transitions, progress counters, and back/forward navigation:

### Step 1: Royal Welcome
- **Personalized Greeting**: "Dear ₹upi ❤️ — Your Wedding Invitation Questionnaire"
- **Warm Message**: Explaining that this form gathers every detail in one place so she doesn't have to answer repeated messages or worry about misspellings.
- **Reassurance Badge**: "Take your time. Your progress is saved automatically on this device."
- **Call to Action**: "Begin Questionnaire ✨"

### Step 2: "A Cordial Invitation From" (Family Details)
- **Father's Name**: Dropdown prefix (`Sh.` / `Late Sh.`) + Full name text input.
- **Mother's Name**: Dropdown prefix (`Smt.` / `Late Smt.`) + Full name text input.
- **Family Residence Address**: Multiline textarea for the official home address.
- **Contact Numbers**: 
  - Primary Mobile (required, with telephone dialer keyboard).
  - Alternate Mobile (optional).

### Step 3: Blessings & Elders
- **Grandmother's Name**: Input with optional honorific (`Smt.` / `Dadi Ji`).
- **Grandfather's Name**: Input with optional honorific (`Sh.` / `Dada Ji`).
- Subtext: "Whose divine blessings guide this auspicious bond."

### Step 4: The Bride (₹upi)
- **Bride's Full Name**: Pre-filled with "Rupa" (editable).
- **Affectionate Moniker**: "₹upi" or initials for custom monogram.
- Subtext: "The radiant queen of the celebration."

### Step 5: The Groom & His Family
- **Groom's Full Name**: Text input.
- **Groom's Mother**: Prefix (`Smt.` / `Late Smt.`) + Name.
- **Groom's Father**: Prefix (`Sh.` / `Late Sh.`) + Name.
- **Family Native Place / City**: Optional text field for wedding card reference.

### Step 6: Auspicious Dates & Times
- **Wedding Date**: Interactive custom royal calendar selector.
- **Haldi Ceremony Date**: Date picker.
- **Mehndi Ceremony Date**: Date picker.

### Step 7: Venues & Locations (With Smart Autofill)
- **Wedding & Reception Venue**: 
  - Default: `Kisan Bhawan, Sector 16, Faridabad, Haryana 121002`
  - Google Maps Pin URL: `https://maps.app.goo.gl/UzVhUn48VhkQPS88A`
- **Haldi Venue**:
  - Quick action buttons: **"Same as Home Address"** | **"Same as Wedding Venue"** | **"Custom Venue"**
  - *Critical Autofill Logic*: When clicking "Same as Home Address", copy the complete string value from `family_address` (never just the first character or substring).
- **Mehndi Venue**:
  - Quick action buttons: **"Same as Home Address"** | **"Same as Wedding Venue"** | **"Custom Venue"**

### Step 8: RSVP Contacts (Dynamic List)
- Add/remove dynamic entries for RSVP contacts printed on the card.
- Each entry includes:
  - Name (e.g., Uncle, Brother, or Family Representative)
  - Mobile Number or Designation
- "+ Add Another RSVP Contact" button.

### Step 9: "With Best Compliments From" (Dynamic List)
- Dynamic list for well-wishers and family groups (e.g., "All Relatives & Friends", "Sharma Family", "Chacha-Chachi Ji").
- Add, edit, and reorder items easily.

### Step 10: Review, Preview & Submit
- **Full Review Card**: Elegant accordion summary showing all entered data across every section with one-click "Edit" buttons jumping directly back to the relevant step.
- **Additional Special Notes**: Free-form textarea for any specific card requirements, Sanskrit shlokas, or invitation card instructions.
- **Submit Button**: Large royal gold button with a submission loading spinner.
- **Submission Success Modal / Celebration**:
  - Golden celebratory confetti.
  - Heartfelt thank-you note: "Thank you, ₹upi! Your wedding details have been safely received."
  - Summary reference badge with submission timestamp.

---

## 7. Interactive Feature Requirements

### 1. Custom Royal Date Picker (`RoyalDatePicker.tsx`)
- Do not use raw OS browser `<input type="date">` as it disrupts the luxury aesthetic.
- Design an elegant popup modal/dropdown with:
  - Month and year navigation in royal burgundy/gold accents.
  - Clear visual highlight for the selected date.
  - Auspicious day indicators (small stars or gold rings).
  - Quick presets (e.g., "Today", "Next Month").
  - Formatted human-readable output (e.g., `Saturday, 28 November 2026`).

### 2. Ambient Wedding Music Player (`MusicPlayer.tsx`)
- Floating gold badge positioned at the corner of the viewport (top-right or bottom-left).
- Plays an ambient instrumental track (e.g., `Christina_Perri_Thousand_years.m4a` or traditional shehnai instrumental).
- Audio controls:
  - Play/Pause toggle with animated equalizer sound waves.
  - Mute/Unmute.
  - Gentle browser-friendly autoplay: Starts softly upon the user's first touch/click interaction on the page (respecting browser autoplay restrictions).

### 3. Local Draft Auto-Save (`localStorage`)
- Automatically serialize the form state to `localStorage.setItem('rupi_wedding_draft', ...)` on every change.
- On page load, if a saved draft exists, quietly restore all fields and prompt the user: "Restored your saved progress ✨".
- Clear draft only after successful database submission.

---

## 8. API Specifications & Endpoints

### 1. Submit Questionnaire (`POST /api/submit`)
- **Route**: `app/api/submit/route.ts`
- **Request Body**: JSON object containing all fields:
  ```json
  {
    "father_prefix": "Sh.",
    "father_name": "...",
    "mother_prefix": "Smt.",
    "mother_name": "...",
    "family_address": "...",
    "mobile_1": "...",
    "mobile_2": "...",
    "grandmother_name": "...",
    "grandfather_name": "...",
    "bride_name": "Rupa",
    "bride_initials": "R",
    "groom_name": "...",
    "groom_mother_prefix": "Smt.",
    "groom_mother_name": "...",
    "groom_father_prefix": "Sh.",
    "groom_father_name": "...",
    "wedding_date": "2026-11-28",
    "haldi_date": "2026-11-27",
    "haldi_venue": "...",
    "mehndi_date": "2026-11-26",
    "mehndi_venue": "...",
    "wedding_reception_venue": "...",
    "wedding_map_url": "...",
    "rsvp_names": ["..."],
    "best_compliments": ["..."],
    "additional_notes": "..."
  }
  ```
- **Validation**:
  - Ensure `father_name`, `mother_name`, `bride_name`, and `groom_name` are not empty.
  - Return `{ success: true, id: <submission_id> }` with HTTP 200 on success.
  - Return `{ error: "<message>" }` with HTTP 500 on database failure.

### 2. Admin API (`GET /api/admin` & `POST /api/admin`)
- **Route**: `app/api/admin/route.ts`
- **Security**: Must check `Authorization: Bearer <ADMIN_SECRET>` or `?secret=<ADMIN_SECRET>`.
- **Response**: List of submissions ordered by `created_at DESC`.
- Supports deletion or status updates (`submitted`, `reviewed`, `designed`).

---

## 9. Protected Admin Dashboard (`/admin`)

Build a private management page at `/admin`:
1. **Passcode Gate**: If `ADMIN_SECRET` is not in session storage or URL query, display a royal lock screen asking for the Admin Passcode.
2. **Submissions List**:
   - Card view of every response with creation timestamp and status badge.
   - Quick-copy button next to each field (e.g., copy bride name, copy venue, copy full summary formatted for the graphic designer).
3. **Data Export Options**:
   - **Download JSON**: Full structured raw payload.
   - **Download CSV**: Spreadsheet format for easy sharing with print vendors.
4. **Direct Actions**:
   - Link to open venue addresses directly in Google Maps.
   - Click-to-call links on phone numbers (`tel:...`).

---

## 10. Favicon & Branding Implementation

- Place the high-resolution logo `rupi.png` in the `public/` directory.
- Configure `app/layout.tsx` metadata with custom icons:
  ```typescript
  export const metadata: Metadata = {
    title: "₹upi Wedding Invitation Details",
    description: "Wedding invitation questionnaire for Rupa (₹upi)",
    icons: {
      icon: [
        { url: "/rupi.png", type: "image/png", sizes: "512x512" },
        { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/rupi.png",
      shortcut: "/rupi.png",
    },
    openGraph: {
      title: "₹upi Wedding Invitation Details ❤️",
      description: "Fill in the wedding invitation card details in one simple, beautiful place.",
      images: [{ url: "/rupi.png", width: 512, height: 512, alt: "₹upi Wedding Details" }],
    },
  };
  ```

---

## 11. Step-by-Step Implementation Instructions

When executing this build:
1. **Configure Environment**: Create `.env` using the template provided in Section 2 with `DATABASE_URL` and `ADMIN_SECRET`.
2. **Setup Database Adapter**: In `lib/db.ts`, implement the Neon serverless client with automatic `initDb()` schema bootstrapping.
3. **Build Core Components**:
   - Create `app/components/RoyalDatePicker.tsx` for custom calendar selection.
   - Create `app/components/MusicPlayer.tsx` for the ambient audio player.
4. **Implement Global Theme**: In `app/globals.css`, declare the royal Indian color tokens, mandala animations, and smooth touch transitions.
5. **Construct Questionnaire Engine**: In `app/page.tsx`, implement the 10-step wizard with local draft auto-saving, validation, and address copy helpers.
6. **Construct Admin Dashboard**: In `app/admin/page.tsx`, build the password-protected viewer with JSON/CSV export and quick-copy tools.
7. **Verify & Validate**: Run the development server, fill out every step as a test user, confirm database entry insertion, and verify mobile responsiveness.

use the assets from "C:\Users\raj00\OneDrive\Desktop\temp_apps\rupi_wedding_invitation_form\public"
push the code to https://github.com/raj0072me/rupi-wedding-invitation