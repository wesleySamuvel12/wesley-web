import * as THREE from 'three'
import { CREATIVE_WORKS } from '@/data/content'

/** Display positions for the creative gallery arc (shared by scene + camera focus) */
export const DISPLAYS: { x: number; y: number; z: number; ry: number }[] = [
  { x: -2.65, y: 0.06, z: 0.35, ry: 0.24 },
  { x: -1.32, y: -0.1, z: -0.35, ry: 0.12 },
  { x: 0, y: 0.1, z: 0.55, ry: 0 },
  { x: 1.32, y: -0.06, z: -0.35, ry: -0.12 },
  { x: 2.65, y: 0.04, z: 0.35, ry: -0.24 },
]

/** Fill target pos/look vectors for zooming into a creative display. */
export function getCreativePose(
  id: string,
  outPos: THREE.Vector3,
  outLook: THREE.Vector3
): boolean {
  const idx = CREATIVE_WORKS.findIndex((w) => w.id === id)
  if (idx < 0 || !DISPLAYS[idx]) return false
  const d = DISPLAYS[idx]
  outPos.set(d.x * 0.42, d.y + 0.06, 2.35)
  outLook.set(d.x, d.y, d.z)
  return true
}
