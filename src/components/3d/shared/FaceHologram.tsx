'use client'

import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * FaceHologram — the ORIGINAL FACE as a living hologram (Smart Attendance).
 *
 *  1. HOLO PLANE — the real face photograph rendered through a hologram
 *     shader: cyan duotone, fine scanlines, a lime scan sweep that climbs the
 *     face, RGB chromatic fringe, projector flicker, and edge dissolve.
 *  2. FACE DUST — image luminance sampled at runtime into a floating point
 *     cloud that hovers just in front of the plane (holographic depth).
 *
 * The photograph is loaded manually (no suspense) so the scene can mount
 * anywhere; until it arrives the surrounding scan cage + sweep carry the beat.
 */

const FACE_URL = '/images/holo/face.png'

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    // chromatic fringe — a hologram never keeps its channels together
    float fr = 0.0022;
    float r = texture2D(uMap, vUv + vec2(fr, 0.0)).r;
    float g = texture2D(uMap, vUv).g;
    float b = texture2D(uMap, vUv - vec2(fr, 0.0)).b;
    float lum = dot(vec3(r, g, b), vec3(0.299, 0.587, 0.114));

    // black backdrop never emits
    if (lum < 0.09) discard;

    // duotone ramp — deep teal → pale cyan → hot white
    vec3 deep = vec3(0.04, 0.40, 0.50);
    vec3 mid  = vec3(0.30, 0.86, 0.93);
    vec3 hot  = vec3(0.85, 1.0, 0.98);
    vec3 tint = mix(deep, mid, smoothstep(0.05, 0.55, lum));
    tint = mix(tint, hot, smoothstep(0.55, 0.95, lum));

    // fine horizontal scanlines drifting upward
    float lines = 0.86 + 0.14 * sin(vUv.y * 260.0 - uTime * 2.2);

    // climbing lime scan sweep
    float sweep = fract(uTime * 0.16);
    float band = exp(-abs(vUv.y - sweep) * 34.0);
    tint += vec3(0.55, 0.9, 0.25) * band * 0.85;

    // projector flicker
    float flick = 0.92 + 0.08 * hash(floor(uTime * 22.0));

    // edge dissolve — projection cone fades at the sides and base
    float edgeX = smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x);
    float edgeY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.88, vUv.y);

    float alpha = uOpacity * flick * lines * edgeX * edgeY * smoothstep(0.09, 0.32, lum);
    gl_FragColor = vec4(tint, alpha);
  }
`

interface FaceHologramProps {
  /** plane width in world units; height follows the photo aspect */
  width?: number
  position?: [number, number, number]
  opacity?: number
}

export default function FaceHologram({ width = 1.1, position = [0, 0, 0], opacity = 1 }: FaceHologramProps) {
  const [map, setMap] = useState<THREE.Texture | null>(null)
  const [aspect, setAspect] = useState(0.75)
  const [dust, setDust] = useState<{ pos: Float32Array; col: Float32Array; count: number } | null>(null)
  const group = useRef<THREE.Group>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: null },
          uTime: { value: 0 },
          uOpacity: { value: opacity },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  )

  /* load the portrait */
  useEffect(() => {
    let disposed = false
    const loader = new THREE.TextureLoader()
    loader.load(
      FACE_URL,
      (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        setMap(tex)
        const img = tex.image as HTMLImageElement | undefined
        if (img?.width && img.height) setAspect(img.width / img.height)
      },
      undefined,
      () => {
        // load failed — hologram stays empty, scene still reads as a scanner
      }
    )
    return () => {
      disposed = true
    }
  }, [])

  /* bind texture + opacity */
  useEffect(() => {
    material.uniforms.uMap.value = map
    material.uniforms.uOpacity.value = opacity
  }, [map, material, opacity])

  /* sample the portrait into a floating point cloud */
  useEffect(() => {
    if (!map) return
    const img = map.image as HTMLImageElement | undefined
    if (!img?.width) return
    const canvas = document.createElement('canvas')
    const W = 96
    const H = Math.round(W / (img.width / img.height))
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(img, 0, 0, W, H)
    let data: Uint8ClampedArray
    try {
      data = ctx.getImageData(0, 0, W, H).data
    } catch {
      return
    }

    const h = width / (img.width / img.height)
    const positions: number[] = []
    const colors: number[] = []
    let seed = 1337
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
        if (lum < 0.3) continue
        const px = (x / (W - 1) - 0.5) * width
        const py = (0.5 - y / (H - 1)) * h
        const pz = 0.035 + lum * 0.07 + (rand() - 0.5) * 0.022
        positions.push(px, py, pz)
        const t = Math.min(1, Math.max(0, (lum - 0.3) / 0.7))
        colors.push(0.3 + t * 0.62, 0.86 + t * 0.14, 0.92 + t * 0.08)
      }
    }
    setDust({ pos: new Float32Array(positions), col: new Float32Array(colors), count: positions.length / 3 })
  }, [map, width])

  /* cleanup */
  useEffect(() => {
    return () => {
      material.dispose()
      map?.dispose()
    }
  }, [material, map])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    material.uniforms.uTime.value = t
    if (group.current) {
      // gentle hologram sway + projector bob — the photo reads alive, not flat
      group.current.rotation.y = Math.sin(t * 0.28) * 0.1
      group.current.position.y = position[1] + Math.sin(t * 0.8) * 0.014
    }
  })

  return (
    <group ref={group} position={position}>
      {map && (
        <mesh>
          <planeGeometry args={[width, width / aspect]} />
          <primitive object={material} attach="material" />
        </mesh>
      )}
      {dust && dust.count > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dust.pos, 3]} />
            <bufferAttribute attach="attributes-color" args={[dust.col, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.011}
            vertexColors
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  )
}
