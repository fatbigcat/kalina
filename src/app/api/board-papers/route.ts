import { writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { validBoardPapers } from '../../../components/boardPaperSettings';

export const runtime = 'nodejs';

/** Provisional local editor: saved values are source defaults, not browser storage. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not available', { status: 404 });
  const origin = request.headers.get('origin');
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).host === request.headers.get('host'); } catch { /* Invalid origin. */ }
  if (!sameOrigin) {
    return new Response('Invalid origin', { status: 403 });
  }
  try {
    const body = await request.text();
    if (body.length > 16000) return new Response('Settings too large', { status: 413 });
    let settings: unknown;
    try { settings = JSON.parse(body); } catch { return new Response('Invalid settings', { status: 400 }); }
    if (!validBoardPapers(settings)) return new Response('Invalid settings', { status: 400 });
    const target = path.join(process.cwd(), 'src/data/board-papers.json');
    const temporary = `${target}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
    await rename(temporary, target);
    return Response.json({ saved: true });
  } catch {
    return new Response('Unable to save settings', { status: 500 });
  }
}
