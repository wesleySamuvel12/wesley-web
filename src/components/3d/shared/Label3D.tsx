'use client'

import * as THREE from 'three'
import { useMemo, useEffect } from 'react'
import { createLabelTexture, createGlowTexture } from '@/lib/textures'

interface Label3DProps {
  text: string
  sub?: string
  accent?: string
  color?: string
  mono?: boolean
  position: [number, number, number]
  /** world height of the label */
  scale?: number
  opacity?: number
}

/** Crisp canvas-texture label on an auto-billboarded sprite (no font fetching). */
export function Label3D({
  text,
  sub,
  accent,
  color,
  mono = false,
  position,
  scale = 0.34,
  opacity = 1,
}: Label3DProps) {
  const tex = useMemo(
    () => createLabelTexture(text, { accent, sub, mono, color }),
    [text, sub, accent, color, mono]
  )
  const aspect = useMemo(() => {
    const img = tex.image as { width: number; height: number }
    return img && img.height > 0 ? img.width / img.height : 4
  }, [tex])

  useEffect(() => () => tex.dispose(), [tex])

  return (
    <sprite position={position} scale={[scale * aspect, scale, 1]} renderOrder={10}>
      <spriteMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </sprite>
  )
}

interface GlowSpriteProps {
  position: [number, number, number]
  scale?: number
  color?: string
  opacity?: number
  inner?: string
}

/** Soft additive radial glow — the "light source" cheat. */
export function GlowSprite({
  position,
  scale = 1,
  color = '#8fd8e8',
  opacity = 0.5,
  inner = 'rgba(255,255,255,1)',
}: GlowSpriteProps) {
  const tex = useMemo(() => createGlowTexture(inner), [inner])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <sprite position={position} scale={[scale, scale, 1]} renderOrder={5}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

/** Build a THREE.Line imperatively (avoids <line> JSX typing clashes with SVG). */
export function makeLine(
  points: [number, number, number][],
  color: string,
  opacity = 1
): THREE.Line {
  const geom = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  )
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: opacity < 1,
    opacity,
    blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
  })
  return new THREE.Line(geom, mat)
}

export function makeLineSegments(positions: number[], color: string, opacity = 1): THREE.LineSegments {
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  return new THREE.LineSegments(geom, mat)
}
