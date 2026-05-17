'use client';

import { getBackendApiBase } from '@/lib/backendApi';
import { Loader2, Send } from 'lucide-react';
import { FormEvent, Fragment, ReactNode, useMemo, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

function renderWithLinks(text: string) {
  const lines = text.split('\n');
  const nodes: Array<ReactNode> = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const parts: Array<ReactNode> = [];
    const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={`link-${lineIndex}-${match.index}`}
          href={match[2]}
          className="text-[#2d5016] underline underline-offset-2 hover:text-[#1f3a0f]"
          target={match[2].startsWith('/') ? undefined : '_blank'}
          rel={match[2].startsWith('/') ? undefined : 'noreferrer'}
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    nodes.push(
      <Fragment key={`line-${lineIndex}`}>
        {parts}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </Fragment>
    );
  }

  return nodes;
}

export default function MatchaAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Xin chào, mình là Chuyên gia Matcha của Shop Matcha. Bạn muốn tư vấn cách pha, lợi ích hay chọn sản phẩm nào phù hợp?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${getBackendApiBase()}/matcha-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Không thể lấy phản hồi tư vấn lúc này.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: String(data.data?.answer || '').trim() }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Mình gặp lỗi khi tư vấn. Bạn thử lại giúp mình sau ít phút nhé.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-3xl border border-[#dbe8cf] bg-white/95 shadow-[0_8px_24px_rgba(70,120,70,0.08)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e6efdd] bg-[#f5faef]">
          <h2 className="text-xl md:text-2xl font-serif text-[#2D5016]">Chuyên Gia Matcha</h2>
          <p className="text-sm text-[#587149] mt-1">Tư vấn Matcha, dụng cụ pha trà và gợi ý sản phẩm đúng theo dữ liệu của Shop.</p>
        </div>

        <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto bg-[#fbfdf8]">
          {messages.map((m, idx) => (
            <div key={`${m.role}-${idx}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#dbeccc] text-[#2b4720]'
                    : 'bg-white border border-[#dfead3] text-[#2b2f2c]'
                }`}
              >
                {m.role === 'assistant' ? renderWithLinks(m.text) : m.text}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-[#dfead3] px-4 py-3 text-sm text-gray-600">
                <Loader2 size={16} className="animate-spin" />
                Đang tư vấn...
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="p-4 border-t border-[#e6efdd] bg-white">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ví dụ: Matcha nào hợp để pha latte ít đắng?"
              className="flex-1 rounded-2xl border border-[#d4e3c6] bg-[#f8fcf4] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b9d4a3]"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#dbeccc] border border-[#c8dfb4] px-4 py-2.5 text-sm font-semibold text-[#355225] transition-colors hover:bg-[#c7e0ae] disabled:opacity-60"
            >
              <Send size={14} /> Gửi
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
