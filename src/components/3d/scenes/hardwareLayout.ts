import * as THREE from 'three'
import { HARDWARE_COMPONENTS } from '@/data/hardware'

/**
 * Camera poses for inspecting a component on the Embedded lab bench.
 * Coordinates live in the embedded scene's world space (bench top ≈ y -0.55).
 */
const POSES: Record<string, { pos: [number, number, number]; look: [number, number, number] }> = {
  esp32: { pos: [-1.18, -0.02, 1.45], look: [-1.28, -0.5, -0.1] },
  arduino: { pos: [0.35, -0.02, 1.45], look: [0.32, -0.5, -0.2] },
  oled: { pos: [-0.46, 0.04, 1.55], look: [-0.42, -0.42, 0.3] },
  ultrasonic: { pos: [1.02, 0.0, 1.6], look: [1.05, -0.5, 0.05] },
  servo: { pos: [1.56, 0.08, 1.72], look: [1.65, -0.44, 0.28] },
  motor: { pos: [-1.8, 0.02, 1.78], look: [-1.9, -0.44, 0.4] },
}

/** Fill target pos/look vectors for zooming into a bench component. */
export function getHardwarePose(id: string, outPos: THREE.Vector3, outLook: THREE.Vector3): boolean {
  const pose = POSES[id]
  if (!pose || !HARDWARE_COMPONENTS.some((c) => c.id === id)) return false
  outPos.set(...pose.pos)
  outLook.set(...pose.look)
  return true
}
