import * as THREE from 'three'
import { WEB_PRODUCTS } from '@/data/web'

/** Browser-window transforms for the live web products scene (shared by scene + camera focus) */
export const WEB_DISPLAYS: { x: number; y: number; z: number; ry: number }[] = [
  { x: -1.52, y: 0.24, z: 0.35, ry: 0.2 },
  { x: 1.56, y: -0.04, z: -0.05, ry: -0.2 },
]

/** Fill target pos/look vectors for zooming into a web product window. */
export function getWebPose(id: string, outPos: THREE.Vector3, outLook: THREE.Vector3): boolean {
  const idx = WEB_PRODUCTS.findIndex((w) => w.id === id)
  if (idx < 0 || !WEB_DISPLAYS[idx]) return false
  const d = WEB_DISPLAYS[idx]
  outPos.set(d.x * 0.52, d.y + 0.02, 2.2)
  outLook.set(d.x, d.y, d.z)
  return true
}
