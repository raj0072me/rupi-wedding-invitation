import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side validation
    if (!body.father_name?.trim()) {
      return NextResponse.json({ error: "Father's name is required." }, { status: 400 });
    }
    if (!body.mother_name?.trim()) {
      return NextResponse.json({ error: "Mother's name is required." }, { status: 400 });
    }
    if (!body.bride_name?.trim()) {
      return NextResponse.json({ error: "Bride's name is required." }, { status: 400 });
    }
    if (!body.groom_name?.trim()) {
      return NextResponse.json({ error: "Groom's name is required." }, { status: 400 });
    }

    // Ensure database table exists
    await initDb();

    const rows = await sql`
      INSERT INTO wedding_submissions (
        father_prefix, father_name,
        mother_prefix, mother_name,
        family_address, mobile_1, mobile_2,
        grandmother_name, grandfather_name,
        bride_name, bride_initials,
        groom_name,
        groom_mother_prefix, groom_mother_name,
        groom_father_prefix, groom_father_name,
        wedding_date,
        haldi_date, haldi_venue,
        mehndi_date, mehndi_venue,
        wedding_reception_venue, wedding_map_url,
        rsvp_names, best_compliments,
        additional_notes, submission_source
      ) VALUES (
        ${body.father_prefix || 'Sh.'}, ${body.father_name?.trim() || ''},
        ${body.mother_prefix || 'Smt.'}, ${body.mother_name?.trim() || ''},
        ${body.family_address?.trim() || ''}, ${body.mobile_1?.trim() || ''}, ${body.mobile_2?.trim() || ''},
        ${body.grandmother_name?.trim() || ''}, ${body.grandfather_name?.trim() || ''},
        ${body.bride_name?.trim() || 'Rupa'}, ${body.bride_initials?.trim() || '₹upi'},
        ${body.groom_name?.trim() || ''},
        ${body.groom_mother_prefix || 'Smt.'}, ${body.groom_mother_name?.trim() || ''},
        ${body.groom_father_prefix || 'Sh.'}, ${body.groom_father_name?.trim() || ''},
        ${body.wedding_date || null},
        ${body.haldi_date || null}, ${body.haldi_venue?.trim() || ''},
        ${body.mehndi_date || null}, ${body.mehndi_venue?.trim() || ''},
        ${body.wedding_reception_venue?.trim() || 'Kisan Bhawan, Sector 16, Faridabad, Haryana 121002'},
        ${body.wedding_map_url?.trim() || 'https://maps.app.goo.gl/UzVhUn48VhkQPS88A'},
        ${JSON.stringify(body.rsvp_names ?? [])}::jsonb,
        ${JSON.stringify(body.best_compliments ?? [])}::jsonb,
        ${body.additional_notes?.trim() || ''},
        ${'web'}
      )
      RETURNING id, created_at
    `;

    return NextResponse.json({
      success: true,
      id: rows[0].id,
      submitted_at: rows[0].created_at,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[submit] Error:', error?.message, error?.stack);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Something went wrong while saving your details. Please try again.',
        ...(isDev && { detail: error?.message }),
      },
      { status: 500 }
    );
  }
}
