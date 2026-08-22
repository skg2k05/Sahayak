import React, { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || reduced || e.pointerType !== 'mouse') return;

      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const target = ref.current;
        if (!target) return;
        target.style.transform = `perspective(950px) rotateX(${((0.5 - py) * maxTilt * 2).toFixed(2)}deg) rotateY(${(
          (px - 0.5) *
          maxTilt *
          2
        ).toFixed(2)}deg) translateZ(6px) scale3d(${scale}, ${scale}, 1)`;

        const glow = glareRef.current;
        if (glow) {
          glow.style.opacity = '1';
          glow.style.background = `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(
            1
          )}%, rgba(109, 93, 251, 0.16), rgba(79, 140, 255, 0.06) 40%, transparent 62%)`;
        }
      });
    },
    [reduced, maxTilt, scale]
  );

  const handleEnter = useCallback(() => {
    const el = ref.current;
    if (el) el.style.willChange = 'transform';
  }, []);

  const handleLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    const el = ref.current;
    if (el) {
      el.style.transform = '';
      el.style.willChange = '';
    }
    const glow = glareRef.current;
    if (glow) glow.style.opacity = '0';
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={`tilt-card relative ${className}`}
      data-tilt-active={!reduced || undefined}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      )}
    </div>
  );
}
