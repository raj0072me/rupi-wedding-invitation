import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function verifyAdmin(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === adminSecret) {
    return true;
  }

  const customHeader = request.headers.get('x-admin-secret');
  if (customHeader === adminSecret) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') === adminSecret) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    const rows = await sql`
      SELECT * FROM wedding_submissions
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ submissions: rows });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[admin] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve submissions.', detail: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deleteAll = searchParams.get('all') === 'true';
  const idParam = searchParams.get('id');

  try {
    await initDb();

    if (deleteAll) {
      await sql`DELETE FROM wedding_submissions`;
      return NextResponse.json({ success: true, message: 'All submissions cleared successfully.' });
    }

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid submission ID.' }, { status: 400 });
      }
      await sql`DELETE FROM wedding_submissions WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: `Submission #${id} deleted successfully.` });
    }

    return NextResponse.json({ error: 'Please specify ?id=<id> or ?all=true' }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[admin delete] Error:', error);
    return NextResponse.json({ error: 'Failed to delete submission.', detail: error.message }, { status: 500 });
  }
}
