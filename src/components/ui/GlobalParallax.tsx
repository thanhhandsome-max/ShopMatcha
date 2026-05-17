'use client';

import { useEffect, useMemo, useState } from 'react';

export default function GlobalParallax() {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(media.matches);
    updateReducedMotion();

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        rafId = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    media.addEventListener('change', updateReducedMotion);

    return () => {
      window.removeEventListener('scroll', onScroll);
      media.removeEventListener('change', updateReducedMotion);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const offsets = useMemo(() => {
    if (reducedMotion) {
      return { a: 0, b: 0, c: 0 };
    }
    return {
      a: Math.min(scrollY * 0.08, 120),
      b: Math.min(scrollY * 0.14, 200),
      c: Math.min(scrollY * 0.2, 260),
    };
  }, [scrollY, reducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-24 -left-16 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-35"
        style={{
          transform: `translate3d(0, ${offsets.a}px, 0)`,
          background: 'radial-gradient(circle at 30% 30%, #d8eec5 0%, #edf7e3 45%, transparent 75%)',
        }}
      />
      <div
        className="absolute top-[18%] -right-24 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30"
        style={{
          transform: `translate3d(0, ${offsets.b}px, 0)`,
          background: 'radial-gradient(circle at 60% 40%, #cfe7b8 0%, #eaf6de 48%, transparent 76%)',
        }}
      />
      <div
        className="absolute bottom-[-7rem] left-[20%] h-[26rem] w-[26rem] rounded-full blur-3xl opacity-25"
        style={{
          transform: `translate3d(0, ${offsets.c}px, 0)`,
          background: 'radial-gradient(circle at 40% 50%, #dfeecf 0%, #f3faec 50%, transparent 78%)',
        }}
      />
    </div>
  );
}
