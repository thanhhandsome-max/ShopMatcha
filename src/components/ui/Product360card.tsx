'use client';

import { useState, useRef } from 'react';

/**
 * Product360Card — CSS 3D flip + auto-rotate effect
 *
 * Dùng trong ProductDetail.tsx hoặc ProductCard.tsx:
 *   import Product360Card from "@/components/Product360Card";
 *
 *   <Product360Card
 *     frontImage={product.image}
 *     backImage={product.imageHover}
 *     alt={product.name}
 *   />
 */

interface Props {
  frontImage: string;
  backImage?: string;
  alt?: string;
}

export default function Product360Card({ frontImage, backImage, alt = '' }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rotateY, setRotateY] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const dragDelta = useRef(0);

  // Mouse drag to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    dragDelta.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    dragDelta.current += Math.abs(dx) + Math.abs(dy);
    setRotateY(prev => prev + dx * 0.5);
    setRotateX(prev => Math.max(-25, Math.min(25, prev - dy * 0.3)));
    lastX.current = e.clientX;
    lastY.current = e.clientY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Snap back X tilt, keep Y spin
    setRotateX(0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
    setRotateX(0);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastX.current;
    const dy = e.touches[0].clientY - lastY.current;
    setRotateY(prev => prev + dx * 0.5);
    setRotateX(prev => Math.max(-25, Math.min(25, prev - dy * 0.3)));
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setRotateX(0);
  };

  const showBack = backImage && Math.abs(((rotateY % 360) + 360) % 360 - 180) < 90;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes autoSpin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer360 {
          0%   { opacity: 0; transform: translateX(-100%) skewX(-15deg); }
          50%  { opacity: 0.4; }
          100% { opacity: 0; transform: translateX(200%) skewX(-15deg); }
        }
        .card-360-wrapper {
          perspective: 1000px;
          cursor: grab;
          user-select: none;
        }
        .card-360-wrapper:active {
          cursor: grabbing;
        }
        .card-360-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: box-shadow 0.3s ease;
        }
        .card-360-inner.idle {
          animation: floatUp 4s ease-in-out infinite;
        }
        .card-360-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          border-radius: 2px;
        }
        .card-360-back {
          transform: rotateY(180deg);
        }
        .shimmer-bar {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.35) 50%,
            transparent 60%
          );
          pointer-events: none;
          animation: shimmer360 1.2s ease forwards;
        }
        .badge-360 {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(45,80,22,0.85);
          color: white;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.2);
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .drag-hint {
          position: absolute;
          bottom: 12px;
          left: 12px;
          font-size: 10px;
          color: rgba(255,255,255,0.8);
          background: rgba(0,0,0,0.35);
          padding: 4px 8px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.4s;
        }
      `}} />

      <div
        className="card-360-wrapper"
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D rotating inner */}
        <div
          className={`card-360-inner ${!isDragging && !isHovered ? 'idle' : ''}`}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxShadow: isHovered
              ? '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)'
              : '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {/* Front face */}
          <div className="card-360-face">
            <img
              src={frontImage}
              alt={alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              draggable={false}
            />
            {/* Shimmer khi hover */}
            {isHovered && <div key={String(isHovered)} className="shimmer-bar" />}
          </div>

          {/* Back face */}
          {backImage && (
            <div className="card-360-face card-360-back">
              <img
                src={backImage}
                alt={`${alt} — góc sau`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Badge 360° */}
        <div className="badge-360" style={{ opacity: isDragging ? 0 : 1 }}>
          360°
        </div>

        {/* Drag hint — ẩn khi đang kéo */}
        <div className="drag-hint" style={{ opacity: isDragging ? 0 : isHovered ? 1 : 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8L22 12L18 16M6 8L2 12L6 16M12 2L12 22"/>
          </svg>
          Kéo để xoay
        </div>
      </div>
    </>
  );
}