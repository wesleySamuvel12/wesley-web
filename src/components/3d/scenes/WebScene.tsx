'use client'

import * as THREE from 'three'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { WEB_DISPLAYS } from './webLayout'
import { WEB_PRODUCTS, type WebProduct } from '@/data/web'
import { useExperienceStore } from '@/lib/store'
import { createGlowTexture } from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'web')

/** browser-frame metrics (shared by frame, chrome bar and screen) */
const FRAME_W = 2.78
const FRAME_H = 2.0
const SCREEN_W = 2.56
const SCREEN_H = 1.6 // 1600x1000 screenshots
const CHROME_H = 0.19
const SCREEN_Y = FRAME_H / 2 - CHROME_H - SCREEN_H / 2 - 0.035

function BrowserWindow({ product, index }: { product: WebProduct; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const cfg = WEB_DISPLAYS[index] ?? { x: 0, y: 0, z: 0, ry: 0 }
  const setFocusedWeb = useExperienceStore((s) => s.setFocusedWeb)
  const setCursor = useExperienceStore((s) => s.setCursor)

  const tex = useTexture(product.image)
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])

  const chromeDots: [number, string][] = [
    [-1.19, '#ff5f57'],
    [-1.11, '#febc2e'],
    [-1.03, '#28c840'],
  ]

  useFrame((state, delta) => {
    const g = ref.current
    if (!g || !g.visible) return
    const t = state.clock.elapsedTime
    const focused = useExperienceStore.getState().focusedWeb
    const isFocused = focused === product.id
    const dim = focused !== null && !isFocused

    const target = hovered || isFocused ? 1.05 : dim ? 0.93 : 1
    const k = 1 - Math.exp(-7 * delta)
    const s = g.scale.x + (target - g.scale.x) * k
    g.scale.setScalar(s)

    g.position.y = cfg.y + Math.sin(t * 0.45 + index * 2.1) * 0.045
    g.rotation.y = cfg.ry + Math.sin(t * 0.2 + index) * 0.03

    const edge = g.children[1] as THREE.Mesh | undefined
    if (edge && (edge.material as THREE.MeshBasicMaterial).opacity !== undefined) {
      const m = edge.material as THREE.MeshBasicMaterial
      const targetOp = isFocused ? 0.55 : hovered ? 0.4 : dim ? 0.05 : 0.16
      m.opacity += (targetOp - m.opacity) * k
    }
  })

  return (
    <group
      ref={ref}
      position={[cfg.x, cfg.y, cfg.z]}
      rotation={[0, cfg.ry, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setCursor('view', 'INSPECT')
      }}
      onPointerOut={() => {
        setHovered(false)
        setCursor('default')
      }}
      onClick={(e) => {
        e.stopPropagation()
        // INSPECT = navigate: clicking / touching a live product window
        // opens the real deployed site in a new tab AND zooms in for the
        // inspect card (auto-returns to normal view after a few seconds)
        setFocusedWeb(product.id)
        window.open(product.url, '_blank', 'noopener,noreferrer')
        setCursor('default')
      }}
    >
      {/* dark aluminum frame */}
      <RoundedBox args={[FRAME_W, FRAME_H, 0.1]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#0d1014" roughness={0.28} metalness={0.82} />
      </RoundedBox>

      {/* accent edge glow */}
      <mesh>
        <boxGeometry args={[FRAME_W + 0.05, FRAME_H + 0.05, 0.06]} />
        <meshBasicMaterial color={product.accent} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* chrome bar */}
      <mesh position={[0, FRAME_H / 2 - CHROME_H / 2 - 0.02, 0.052]}>
        <planeGeometry args={[SCREEN_W, CHROME_H]} />
        <meshBasicMaterial color="#12161c" toneMapped={false} />
      </mesh>
      {chromeDots.map(([x, c]) => (
        <mesh key={c} position={[x, FRAME_H / 2 - CHROME_H / 2 - 0.02, 0.056]}>
          <circleGeometry args={[0.016, 16]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
      {/* URL pill */}
      <RoundedBox args={[1.62, 0.105, 0.012]} radius={0.05} smoothness={3} position={[0.42, FRAME_H / 2 - CHROME_H / 2 - 0.02, 0.058]}>
        <meshBasicMaterial color="#1c2129" toneMapped={false} />
      </RoundedBox>
      <Label3D
        text={product.domain.toUpperCase()}
        position={[0.42, FRAME_H / 2 - CHROME_H / 2 - 0.02, 0.07]}
        scale={0.052}
        mono
        color="#9fb4c8"
      />

      {/* screenshot */}
      <mesh position={[0, SCREEN_Y, 0.054]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* glass sheen */}
      <mesh position={[0, SCREEN_Y, 0.057]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.045} depthWrite={false} />
      </mesh>

      <GlowSprite position={[0, -FRAME_H / 2 - 0.28, 0.2]} scale={1.7} color={product.accent} opacity={0.07} />
      <Label3D
        text={product.title}
        sub={product.category}
        position={[0, -FRAME_H / 2 - 0.3, 0.15]}
        scale={0.135}
        accent={product.accent}
      />
    </group>
  )
}

/** SCENE 07 — Live web products: two real deployed sites in floating browser windows */
export default function WebScene() {
  const group = useSceneVisibility(IDX)
  const glowA = useMemo(() => createGlowTexture('rgba(103,232,249,1)'), [])
  const glowB = useMemo(() => createGlowTexture('rgba(190,242,100,1)'), [])
  useEffect(() => () => {
    glowA.dispose()
    glowB.dispose()
  }, [glowA, glowB])

  return (
    <group ref={group}>
      {WEB_PRODUCTS.map((p, i) => (
        <BrowserWindow key={p.id} product={p} index={i} />
      ))}

      <ParticleField count={240} spread={[12, 6, 10]} size={0.02} color="#b9d2c8" opacity={0.2} speed={0.011} seed={87} />
      <GlowSprite position={[0, 0.4, -5]} scale={9} color="#0c1014" opacity={0.55} />

      {/* dark stage, cool key + warm/violet rims */}
      <spotLight position={[0, 3.6, 4.6]} angle={0.7} penumbra={1} intensity={42} color="#dfeaf2" distance={16} decay={2} />
      <pointLight position={[-4.2, 0.6, -2]} intensity={9} color="#67e8f9" distance={12} decay={2} />
      <pointLight position={[4.2, 0.5, -2]} intensity={9} color="#bef264" distance={12} decay={2} />
      <ambientLight intensity={0.24} />
    </group>
  )
}
