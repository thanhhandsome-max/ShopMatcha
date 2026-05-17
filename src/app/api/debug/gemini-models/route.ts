import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'Thiếu cấu hình GEMINI_API_KEY trên server.' }, { status: 500 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data?.error?.message || 'Không lấy được danh sách model.' }, { status: 502 });
    }

    // Return the raw models list (safe: runs server-side and does not expose the API key)
    return NextResponse.json({ success: true, models: data.models || data });
  } catch (err) {
    return NextResponse.json({ success: false, message: String(err) }, { status: 500 });
  }
}
