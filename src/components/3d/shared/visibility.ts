'use client'

import * as THREE from 'three'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { getScrollState } from '@/lib/scrollEngine'

/**
 * r3f raycasts objects with handlers even when they are invisible, and it
 * raycasts each handler-owning object DIRECTLY (ancestors are not consulted).
 * A hidden scene would otherwise absorb hovers/clicks aimed at the active one.
 * Returning `false` from Object3D.raycast makes the Raycaster skip the object
 * and its subtree, so we block every descendant while the scene is hidden and
 * restore the prototype method when it becomes visible again.
 */
const NO_RAYCAST = () => false as const

/** Object3D with an optional own-property raycast override */
type RaycastTarget = { raycast?: THREE.Object3D['raycast'] }

function setSubtreeRaycast(root: THREE.Object3D, blocked: boolean) {
  root.traverse((o) => {
    const target = o as unknown as RaycastTarget
    if (blocked) {
      target.raycast = NO_RAYCAST
    } else {
      // drop the own-property override → prototype raycast is restored
      delete target.raycast
    }
  })
}

/**
 * Toggles a group's visibility based on how close the camera timeline is to
 * this scene. Asymmetric window: appears in the final ~40% of the previous
 * scene and stays until ~42% into the next one. While hidden the whole group
 * is non-raycastable so it can never steal pointer events.
 */
export function useSceneVisibility(index: number, buffer = 0.4, exit = 1.12) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const sf = getScrollState().sceneFloat
    const active = sf > index - buffer && sf < index + exit
    if (g.visible !== active) {
      g.visible = active
      setSubtreeRaycast(g, !active)
    }
  })
  return ref
}

/** Stable per-frame visibility check for use inside other useFrame callbacks */
export function isSceneActive(index: number, buffer = 0.4): boolean {
  const sf = getScrollState().sceneFloat
  return sf > index - buffer && sf < index + 1.32
}
