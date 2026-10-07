'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { envBus, UNDERWATER_BG, UNDERWATER_DENSITY } from '@/lib/envBus'
import { getScrollState } from '@/lib/scrollEngine'
import { clamp01, easeInOut } from '@/lib/scenes'

const _a = new THREE.Color()
const _b = new THREE.Color()

/**
 * Applies background + fog to the scene every frame.
 * Must be the LAST useFrame subscriber (mounted after all scenes)
 * so scene overrides (underwater) win.
 */
export default function EnvController() {
  const applied = useRef(false)

  useFrame(({ scene }, delta) => {
    const s = getScrollState()
    const i = Math.min(s.sceneIndex, SCENES.length - 1)
    const next = SCENES[Math.min(i + 1, SCENES.length - 1)]
    const t = easeInOut(clamp01(s.sceneLocal))

    _a.set(SCENES[i].bg)
    _b.set(next.bg)
    envBus.cur.copy(_a).lerp(_b, t)

    const dBase = SCENES[i].fog + (next.fog - SCENES[i].fog) * t

    envBus.underwaterMix = THREE.MathUtils.damp(envBus.underwaterMix, envBus.underwater ? 1 : 0, 2.4, Math.min(delta, 0.05))
    const m = envBus.underwaterMix
    const density = dBase + (UNDERWATER_DENSITY - dBase) * m
    if (m > 0.001) envBus.cur.lerp(UNDERWATER_BG, m)

    const bg = scene.background as THREE.Color | null
    if (bg) bg.copy(envBus.cur)
    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) {
      fog.color.copy(envBus.cur)
      fog.density = density
    }
    applied.current = true
  })

  return null
}
