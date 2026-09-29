import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _cachedSql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_cachedSql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set. Please add it to your environment variables.');
    }
    _cachedSql = neon(url);
  }
  return _cachedSql;
}

// Proxied sql template tag — safe during static build evaluation
export const sql: NeonQueryFunction<false, false> = ((strings: TemplateStringsArray, ...values: unknown[]) => {
  return getDb()(strings, ...values);
}) as unknown as NeonQueryFunction<false, false>;

/**
 * Initialize the database — creates the wedding_submissions table if it does not exist.
 */
export async function initDb() {
  await sql`
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
  `;

  // Index for instant chronological sorting in admin portal
  await sql`
    CREATE INDEX IF NOT EXISTS idx_wedding_submissions_created_at
    ON wedding_submissions(created_at DESC);
  `;
}

export type WeddingSubmission = {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  father_prefix: string;
  father_name: string;
  mother_prefix: string;
  mother_name: string;
  family_address: string;
  mobile_1: string;
  mobile_2: string;
  grandmother_name: string;
  grandfather_name: string;
  bride_name: string;
  bride_initials: string;
  groom_name: string;
  groom_mother_prefix: string;
  groom_mother_name: string;
  groom_father_prefix: string;
  groom_father_name: string;
  wedding_date: string | null;
  haldi_date: string | null;
  haldi_venue: string;
  mehndi_date: string | null;
  mehndi_venue: string;
  wedding_reception_venue: string;
  wedding_map_url: string;
  rsvp_names: string[] | { name: string; contact?: string }[];
  best_compliments: string[];
  additional_notes: string;
  submission_source: string;
};
