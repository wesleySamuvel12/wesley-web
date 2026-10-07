'use client'

import * as THREE from 'three'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { getScrollState } from '@/lib/scrollEngine'

/**
 * Toggles a group's visibility based on how close the camera timeline is to
 * this scene. Asymmetric window: appears in the final ~40% of the previous
 * scene and stays until ~42% into the next one.
 */
export function useSceneVisibility(index: number, buffer = 0.4, exit = 1.12) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const sf = getScrollState().sceneFloat
    const active = sf > index - buffer && sf < index + exit
    if (g.visible !== active) g.visible = active
  })
  return ref
}

/** Stable per-frame visibility check for use inside other useFrame callbacks */
export function isSceneActive(index: number, buffer = 0.4): boolean {
  const sf = getScrollState().sceneFloat
  return sf > index - buffer && sf < index + 1.32
}
