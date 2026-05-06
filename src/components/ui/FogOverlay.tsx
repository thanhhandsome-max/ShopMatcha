'use client';
export default function FogOverlay() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mistDrift1 {
          0%   { transform: translate(-60px, 10px); }
          50%  { transform: translate(60px, -10px); }
          100% { transform: translate(-60px, 10px); }
        }
        @keyframes mistDrift2 {
          0%   { transform: translate(70px, -15px); }
          50%  { transform: translate(-50px, 20px); }
          100% { transform: translate(70px, -15px); }
        }
        @keyframes mistDrift3 {
          0%   { transform: translate(-40px, -20px); }
          50%  { transform: translate(55px, 15px); }
          100% { transform: translate(-40px, -20px); }
        }
        @keyframes mistDrift4 {
          0%   { transform: translate(30px, 25px); }
          50%  { transform: translate(-65px, -10px); }
          100% { transform: translate(30px, 25px); }
        }
        @keyframes mistDrift5 {
          0%   { transform: translate(-50px, 5px); }
          50%  { transform: translate(40px, -25px); }
          100% { transform: translate(-50px, 5px); }
        }
        @keyframes mistDrift6 {
          0%   { transform: translate(45px, -5px); }
          50%  { transform: translate(-35px, 20px); }
          100% { transform: translate(45px, -5px); }
        }
        @keyframes mistDrift7 {
          0%   { transform: translate(-55px, 20px); }
          50%  { transform: translate(50px, -15px); }
          100% { transform: translate(-55px, 20px); }
        }
        @keyframes mistDrift8 {
          0%   { transform: translate(40px, -20px); }
          50%  { transform: translate(-60px, 10px); }
          100% { transform: translate(40px, -20px); }
        }
        @keyframes mistDrift9 {
          0%   { transform: translate(-30px, -10px); }
          50%  { transform: translate(70px, 20px); }
          100% { transform: translate(-30px, -10px); }
        }
        @keyframes mistDrift10 {
          0%   { transform: translate(60px, 15px); }
          50%  { transform: translate(-40px, -20px); }
          100% { transform: translate(60px, 15px); }
        }
      `}} />

      {/* Blob 1 — top-left */}
      <div style={{
        position: 'absolute',
        width: '750px', height: '380px',
        top: '-10%', left: '-12%',
        background: 'radial-gradient(ellipse 52% 52% at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 40%, transparent 70%)',
        filter: 'blur(48px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift1 25s ease-in-out infinite',
      }} />

      {/* Blob 2 — top-right */}
      <div style={{
        position: 'absolute',
        width: '680px', height: '340px',
        top: '3%', right: '-10%',
        background: 'radial-gradient(ellipse 52% 52% at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 42%, transparent 70%)',
        filter: 'blur(52px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift2 30s ease-in-out infinite',
        animationDelay: '-8s',
      }} />

      {/* Blob 3 — upper-center */}
      <div style={{
        position: 'absolute',
        width: '800px', height: '320px',
        top: '8%', left: '15%',
        background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 45%, transparent 72%)',
        filter: 'blur(58px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift3 35s ease-in-out infinite',
        animationDelay: '-14s',
      }} />

      {/* Blob 4 — mid-left */}
      <div style={{
        position: 'absolute',
        width: '620px', height: '300px',
        top: '28%', left: '-8%',
        background: 'radial-gradient(ellipse 52% 50% at 50% 50%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.28) 44%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift4 28s ease-in-out infinite',
        animationDelay: '-5s',
      }} />

      {/* Blob 5 — mid-right */}
      <div style={{
        position: 'absolute',
        width: '660px', height: '310px',
        top: '32%', right: '-8%',
        background: 'radial-gradient(ellipse 52% 50% at 50% 50%, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.26) 44%, transparent 70%)',
        filter: 'blur(54px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift7 27s ease-in-out infinite',
        animationDelay: '-18s',
      }} />

      {/* Blob 6 — center wide */}
      <div style={{
        position: 'absolute',
        width: '900px', height: '300px',
        top: '40%', left: '5%',
        background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.22) 48%, transparent 74%)',
        filter: 'blur(65px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift8 32s ease-in-out infinite',
        animationDelay: '-11s',
      }} />

      {/* Blob 7 — lower-left */}
      <div style={{
        position: 'absolute',
        width: '700px', height: '320px',
        bottom: '10%', left: '-5%',
        background: 'radial-gradient(ellipse 52% 52% at 50% 50%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.32) 42%, transparent 70%)',
        filter: 'blur(46px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift9 24s ease-in-out infinite',
        animationDelay: '-3s',
      }} />

      {/* Blob 8 — lower-right */}
      <div style={{
        position: 'absolute',
        width: '650px', height: '300px',
        bottom: '8%', right: '-6%',
        background: 'radial-gradient(ellipse 52% 50% at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 42%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift10 29s ease-in-out infinite',
        animationDelay: '-21s',
      }} />

      {/* Blob 9 — bottom wide ground mist */}
      <div style={{
        position: 'absolute',
        width: '100%', height: '220px',
        bottom: '0%', left: '0',
        background: 'radial-gradient(ellipse 120% 100% at 50% 115%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 35%, transparent 68%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift1 20s ease-in-out infinite',
        animationDelay: '-9s',
      }} />

      {/* Blob 10 — scattered center filler */}
      <div style={{
        position: 'absolute',
        width: '850px', height: '280px',
        top: '55%', left: '8%',
        background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 48%, transparent 74%)',
        filter: 'blur(62px)',
        pointerEvents: 'none',
        zIndex: 6,
        animation: 'mistDrift5 38s ease-in-out infinite',
        animationDelay: '-25s',
      }} />
    </>
  );
}