'use client'

import { useRef, useCallback, useEffect, useState, ReactNode } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { useExperienceStore } from '@/lib/store'

interface GlassCardProps {
  children: ReactNode
  className?: string
  tilt?: boolean
  glowColor?: string
  floatDelay?: number
}

/**
 * Translucent glass panel with 3D tilt, cursor-following light reflection
 * and a slow float loop. Pure CSS/GPU — no re-renders on pointer move.
 */
export function GlassCard({ children, className, tilt = true, glowColor = 'rgba(190,242,100,0.10)', floatDelay = 0 }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el || !tilt) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      gsap.to(el, {
        rotateY: (px - 0.5) * 7,
        rotateX: (0.5 - py) * 7,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 900,
      })
    },
    [tilt]
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
  }, [])

  return (
    <div className="glass-float" style={{ animationDelay: `${floatDelay}s` }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn('glass-panel', className)}
        style={{
          // @ts-expect-error CSS custom properties
          '--glow': glowColor,
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface MagneticButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  className?: string
  external?: boolean
  cursorLabel?: string
}

/** Magnetic CTA with soft glow + border animation */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'ghost',
  className,
  external = false,
  cursorLabel = 'OPEN',
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    gsap.to(el, { x: dx * 0.22, y: dy * 0.22, duration: 0.4, ease: 'power3.out' })
    if (inner.current) {
      gsap.to(inner.current, { x: dx * 0.12, y: dy * 0.12, duration: 0.5, ease: 'power3.out' })
    }
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    if (inner.current) {
      gsap.to(inner.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    }
  }, [])

  const setCursor = useCallback((label: string) => {
    useExperienceStore.getState().setCursor(label === 'default' ? 'default' : 'open', label)
  }, [])

  const cls = cn(
    'magnetic-btn',
    variant === 'primary' ? 'magnetic-btn--primary' : 'magnetic-btn--ghost',
    className
  )

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onMouseEnter={() => setCursor(cursorLabel)}
        data-cursor={cursorLabel}
        onClick={onClick}
      >
        <span ref={inner} className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={cls}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setCursor(cursorLabel)}
      data-cursor={cursorLabel}
      onClick={onClick}
    >
      <span ref={inner} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  )
}

/** Small uppercase mono eyebrow label used across overlays */
export function Eyebrow({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2.5 font-mono text-[10px] tracking-[0.32em] text-white/45 uppercase', className)}
      {...rest}
    >
      <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#bef264] shadow-[0_0_8px_rgba(190,242,100,0.9)]" />
      {children}
    </div>
  )
}

/**
 * Depleting bar + seconds counter shown while an element is focused.
 * Communicates that the view automatically returns to normal.
 * Remount (via key) or change `returnAt` to restart the countdown.
 */
export function AutoReturnBar({
  returnAt,
  duration = 7000,
  accent = '#bef264',
  className,
}: {
  returnAt: number | null
  duration?: number
  accent?: string
  className?: string
}) {
  const bar = useRef<HTMLDivElement>(null)
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil(((returnAt ?? 0) - Date.now()) / 1000)))

  useEffect(() => {
    const el = bar.current
    if (!el) return
    const total = Math.max(0, (returnAt ?? 0) - Date.now())
    if (total <= 0) {
      el.style.transition = 'none'
      el.style.width = '0%'
      setRemaining(0)
      return
    }
    el.style.transition = 'none'
    el.style.width = '100%'
    const raf = requestAnimationFrame(() => {
      el.style.transition = `width ${total}ms linear`
      el.style.width = '0%'
    })
    const iv = window.setInterval(() => {
      setRemaining(Math.max(0, Math.ceil(((returnAt ?? 0) - Date.now()) / 1000)))
    }, 250)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(iv)
    }
  }, [returnAt])

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="font-mono text-[7.5px] tracking-[0.26em] text-white/35">AUTO RETURN</span>
      <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
        <div ref={bar} className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: accent, width: '100%' }} />
      </div>
      <span className="w-4 text-right font-mono text-[7.5px] tracking-[0.1em] text-white/45">{remaining}s</span>
    </div>
  )
}
