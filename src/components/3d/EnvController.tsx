'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { envBus, UNDERWATER_BG, UNDERWATER_DENSITY } from '@/lib/envBus'
import { getScrollState } from '@/lib/scrollEngine'

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

    // hard film cuts: the environment belongs to exactly ONE scene at a time.
    // It snaps at the boundary while the SceneDip overlay masks the swap —
    // no cross-scene colour blending, nothing "mixes" while scrolling.
    envBus.cur.set(SCENES[i].bg)
    const dBase = SCENES[i].fog

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
