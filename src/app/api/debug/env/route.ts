import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GOOGLE_API_KEY);
    return NextResponse.json({ geminiConfigured: hasKey });
  } catch (err) {
    return NextResponse.json({ geminiConfigured: false, error: String(err) }, { status: 500 });
  }
}
