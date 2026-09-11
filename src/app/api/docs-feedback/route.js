import { NextResponse } from 'next/server';

// Fields are truncated (not rejected) to avoid losing useful feedback over length limits.
// Will revisit policy after observing real usage patterns.
const MAX_LENGTHS = {
  feedback: 3000,
  path: 500,
};

const API_INFO = JSON.stringify({
  endpoint: 'POST /api/docs-feedback',
  description:
    'Please report a documentation issue: wrong info, missing steps, or anything unclear.',
  body: {
    feedback: 'string, required — describe the issue',
    path: 'string, optional — page path or doc URL (e.g. /docs/introduction)',
  },
  example: {
    feedback: 'The connection string example is missing sslmode=require',
    path: '/docs/introduction',
  },
});

export async function GET() {
  return new Response(API_INFO, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
    if (!feedback) {
      return NextResponse.json({ error: 'feedback is required' }, { status: 400 });
    }

    const data = { feedback: feedback.slice(0, MAX_LENGTHS.feedback) };

    const path = typeof body.path === 'string' ? body.path.trim() : '';
    if (path) {
      data.path = path.slice(0, MAX_LENGTHS.path);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[docs-feedback] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
