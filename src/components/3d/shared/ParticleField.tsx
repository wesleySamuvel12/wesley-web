'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { createGlowTexture } from '@/lib/textures'
import { mulberry32 } from '@/lib/input'

interface ParticleFieldProps {
  count?: number
  spread?: [number, number, number]
  center?: [number, number, number]
  size?: number
  color?: string
  opacity?: number
  speed?: number
  rise?: number
  seed?: number
}

/**
 * GPU-friendly particle cloud — one Points object, additive glow sprite,
 * optional slow rise + swirl. No per-particle React elements.
 */
export default function ParticleField({
  count = 1000,
  spread = [16, 9, 16],
  center = [0, 0, 0],
  size = 0.04,
  color = '#9fc4d8',
  opacity = 0.45,
  speed = 0.02,
  rise = 0,
  seed = 1,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null)

  const geom = useMemo(() => {
    const rnd = mulberry32(seed * 7919 + count)
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * spread[0]
      pos[i * 3 + 1] = (rnd() - 0.5) * spread[1]
      pos[i * 3 + 2] = (rnd() - 0.5) * spread[2]
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count, seed, spread[0], spread[1], spread[2]])

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        map: createGlowTexture(),
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [size, color, opacity]
  )

  useEffect(() => {
    return () => {
      geom.dispose()
      const m = mat.map
      mat.dispose()
      m?.dispose()
    }
  }, [geom, mat])

  useFrame((_, delta) => {
    const p = ref.current
    if (!p || !p.visible) return
    p.rotation.y += speed * delta
    if (rise !== 0) {
      const attr = geom.getAttribute('position') as THREE.BufferAttribute | undefined
      if (!attr) return
      const arr = attr.array as Float32Array
      const half = spread[1] / 2
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] += rise * delta
        if (arr[i] > half) arr[i] = -half
      }
      attr.needsUpdate = true
    }
  })

  return (
    <group position={center}>
      <points ref={ref} geometry={geom} material={mat} frustumCulled={false} />
    </group>
  )
}
