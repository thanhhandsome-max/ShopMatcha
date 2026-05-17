import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/db/prisma';

// Use environment override if provided; fall back to a broadly available model
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function resolveGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GOOGLE_API_KEY || '';
}

function normalizeGeminiModel(rawModel: string) {
  return String(rawModel || '')
    .trim()
    .replace(/^models\//i, '')
    .replace(/^\/+/, '') || 'gemini-1.5-flash';
}

function formatPrice(value: unknown) {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')} đ`;
}

function buildProductUrl(maSP: string) {
  const base = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, '') || '';
  const path = `/products/${encodeURIComponent(maSP)}`;
  return base ? `${base}${path}` : path;
}

function buildSystemPrompt(productContext: string) {
  return `Bạn là "Chuyên gia Matcha" - Trợ lý AI thông minh và tận tâm của cửa hàng Shop Matcha.

NHIỆM VỤ CỐT LÕI:
1. Chỉ trả lời các câu hỏi liên quan đến Matcha (nguồn gốc, lợi ích, cách pha chế, văn hóa trà đạo) và các dụng cụ pha trà liên quan.
2. Nếu khách hàng hỏi về chủ đề không liên quan Matcha, hãy lịch sự từ chối và dẫn dắt quay lại Matcha.
3. Luôn bám sát danh mục sản phẩm từ DATABASE được cung cấp để giới thiệu sản phẩm phù hợp.

QUY TẮC PHẢN HỒI:
- Khi khách hỏi công dụng/cách dùng: giải thích rõ và gợi ý sản phẩm tương ứng.
- Khi khách hỏi giá/loại sản phẩm: lấy thông tin từ DATABASE.
- Không bịa sản phẩm hoặc giá.
- Khi nhắc sản phẩm, BẮT BUỘC chèn link theo định dạng [Tên sản phẩm](Link_Sản_Phẩm).
- Nếu không có đúng sản phẩm, gợi ý sản phẩm gần nhất và nói rõ shop hiện có dòng đó.
- Trả lời bằng tiếng Việt, giọng thân thiện, chuyên nghiệp, ngắn gọn.

DỮ LIỆU SẢN PHẨM (DATABASE CONTEXT):
${productContext}`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Thiếu cấu hình GEMINI_API_KEY trên server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const userMessage = String(body?.message || '').trim();

    if (!userMessage) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập nội dung câu hỏi.' }, { status: 400 });
    }

    const products = await prisma.sanpham.findMany({
      where: { TrangThai: 1 },
      select: {
        MaSP: true,
        TenSP: true,
        GiaBan: true,
        Mota: true,
        loaisanpham: {
          select: { TenLoai: true }
        },
        sanpham_anh: {
          orderBy: [{ AnhChinh: 'desc' }, { ThuTu: 'asc' }],
          take: 1,
          select: { DuongDanAnh: true }
        }
      },
      take: 60,
      orderBy: { NgayTao: 'desc' }
    });

    const productContext = products
      .map((p) => {
        const name = p.TenSP || p.MaSP;
        const price = formatPrice(p.GiaBan);
        const category = p.loaisanpham?.TenLoai || 'Matcha';
        const url = buildProductUrl(p.MaSP);
        const image = p.sanpham_anh?.[0]?.DuongDanAnh || '';
        const desc = String(p.Mota || '').replace(/\s+/g, ' ').slice(0, 180);
        return `- ${name} | Mã: ${p.MaSP} | Giá: ${price} | Loại: ${category} | Link: ${url} | Ảnh: ${image || 'N/A'} | Mô tả: ${desc || 'N/A'}`;
      })
      .join('\n');

    const systemPrompt = buildSystemPrompt(productContext || 'Không có dữ liệu sản phẩm.');

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 800
      }
    };

    const preferredModel = normalizeGeminiModel(GEMINI_MODEL);
    const candidateModels = Array.from(
      new Set([
        preferredModel,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-pro',
        'gemini-3.1-flash-lite'
      ])
    );

    let geminiData: any = null;
    let geminiStatus = 0;
    let lastErrorMessage = '';

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      geminiStatus = geminiRes.status;
      try {
        geminiData = await geminiRes.json();
      } catch (err) {
        geminiData = null;
        console.error('Failed to parse Gemini response JSON', err);
      }

      if (geminiRes.ok) {
        break;
      }

      const errMsg = geminiData?.error?.message || `Gemini returned status ${geminiRes.status}`;
      lastErrorMessage = errMsg;
      console.error('Gemini API error', { model, status: geminiRes.status, body: geminiData });

      // Retry on model-not-found/not-supported, otherwise stop early
      if (geminiRes.status !== 404) {
        return NextResponse.json({ success: false, message: errMsg }, { status: 502 });
      }
    }

    if (!geminiData?.candidates?.length) {
      return NextResponse.json(
        { success: false, message: lastErrorMessage || `Gemini returned status ${geminiStatus || 502}` },
        { status: 502 }
      );
    }

    const answer =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('\n')
        .trim() || 'Xin lỗi, hiện tại tôi chưa thể trả lời. Bạn thử lại giúp mình nhé.';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        productsCount: products.length
      }
    });
  } catch (error) {
    console.error('Matcha assistant error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi xử lý tư vấn Matcha.' }, { status: 500 });
  }
}
