import * as THREE from 'three'
import { WEB_PRODUCTS } from '@/data/web'

/** Browser-window transforms for the live web products scene (shared by scene + camera focus) */
export const WEB_DISPLAYS: { x: number; y: number; z: number; ry: number }[] = [
  { x: -2.18, y: 0.3, z: 0.5, ry: 0.26 },
  { x: 0.06, y: 0.62, z: -1.15, ry: 0.02 },
  { x: 2.3, y: 0.52, z: 0.05, ry: -0.26 },
]

/** Fill target pos/look vectors for zooming into a web product window. */
export function getWebPose(id: string, outPos: THREE.Vector3, outLook: THREE.Vector3): boolean {
  const idx = WEB_PRODUCTS.findIndex((w) => w.id === id)
  if (idx < 0 || !WEB_DISPLAYS[idx]) return false
  const d = WEB_DISPLAYS[idx]
  // depth-relative stand-off keeps every window equally full-bleed on focus,
  // no matter how near/far its resting position is
  outPos.set(d.x * 0.52, d.y + 0.02, d.z + 1.78)
  outLook.set(d.x, d.y, d.z)
  return true
}
