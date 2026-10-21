'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getScrollState } from '@/lib/scrollEngine'
import { SCENES } from '@/lib/scenes'

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
 * HARD FILM CUTS — scenes never share the frame.
 * Scene i is mounted ONLY while the camera timeline is inside its own beat
 * (sceneFloat ∈ [i - pad, i + 1 - pad)). The tiny `pad` shifts the swap a
 * hair BEFORE the boundary so the SceneDip overlay is still ~86% opaque when
 * content swaps — the cut is fully masked, nothing ever "mixes" with the
 * next scene while scrolling. The last scene stays mounted to the absolute
 * end of the track. While hidden the whole group is non-raycastable so it
 * can never steal pointer events.
 */
const CUT_PAD = 0.012

function isActive(index: number, sf: number): boolean {
  if (sf < index - CUT_PAD) return false
  if (index === SCENES.length - 1) return sf <= index + 1
  return sf < index + 1 - CUT_PAD
}

export function useSceneVisibility(index: number) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const active = isActive(index, getScrollState().sceneFloat)
    if (g.visible !== active) {
      g.visible = active
      setSubtreeRaycast(g, !active)
    }
  })
  return ref
}

/** Stable per-frame visibility check for use inside other useFrame callbacks */
export function isSceneActive(index: number): boolean {
  return isActive(index, getScrollState().sceneFloat)
}
