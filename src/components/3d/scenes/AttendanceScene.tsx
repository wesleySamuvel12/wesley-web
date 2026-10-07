'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { createQrTexture, createScreenTexture, createGridTexture, createGlowTexture } from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'attendance')

/** PROJECT 02 — Smart Attendance: campus gate with face-scan + QR + geofence */
export default function AttendanceScene() {
  // exit early — HydroFloat occupies the same world space right after this scene
  const group = useSceneVisibility(IDX, 0.4, 0.98)
  const scanLine = useRef<THREE.Mesh>(null)
  const face = useRef<THREE.Mesh>(null)
  const geoRing = useRef<THREE.Mesh>(null)
  const qr = useRef<THREE.Group>(null)

  const qrTex = useMemo(() => createQrTexture(42), [])
  const dash = useMemo(
    () => createScreenTexture(['CHECK-IN', '98.2% MATCH', 'GEOFENCE OK'], '#67e8f9', 8),
    []
  )
  const grid = useMemo(() => createGridTexture(1024), [])
  const glow = useMemo(() => createGlowTexture('rgba(103,232,249,1)'), [])

  useEffect(() => {
    return () => {
      qrTex.dispose()
      dash.dispose()
      grid.dispose()
      glow.dispose()
    }
  }, [qrTex, dash, grid, glow])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (scanLine.current) {
      scanLine.current.position.y = 0.55 + Math.sin(t * 1.1) * 0.5
      const m = scanLine.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.55 + Math.sin(t * 6) * 0.2
    }
    if (face.current) {
      face.current.rotation.y = Math.sin(t * 0.3) * 0.5
      face.current.rotation.x = Math.cos(t * 0.22) * 0.15
    }
    if (geoRing.current) {
      const m = geoRing.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.2 + Math.sin(t * 1.6) * 0.1
      const s = 1 + Math.sin(t * 1.6) * 0.015
      geoRing.current.scale.set(s, 1, s)
    }
    if (qr.current) {
      qr.current.position.y = 0.62 + Math.sin(t * 0.7) * 0.05
      qr.current.rotation.y = Math.sin(t * 0.4) * 0.2 - 0.3
    }
  })

  return (
    <group ref={group}>
      {/* gate pillars */}
      {[-1.45, 1.45].map((x) => (
        <group key={x} position={[x, 0.5, -0.6]}>
          <RoundedBox args={[0.3, 2.7, 0.3]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#12161c" roughness={0.32} metalness={0.85} />
          </RoundedBox>
          <mesh position={[x > 0 ? -0.16 : 0.16, 0, 0]}>
            <boxGeometry args={[0.015, 2.3, 0.05]} />
            <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* beam */}
      <RoundedBox args={[3.5, 0.26, 0.32]} radius={0.04} smoothness={4} position={[0, 1.95, -0.6]}>
        <meshStandardMaterial color="#12161c" roughness={0.32} metalness={0.85} />
      </RoundedBox>
      <mesh position={[0, 1.81, -0.6]}>
        <boxGeometry args={[3.2, 0.012, 0.04]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* scanner hologram */}
      <group position={[0, 0.75, -0.58]}>
        <mesh>
          <planeGeometry args={[1.25, 1.75]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={face} position={[0, 0.25, 0.06]}>
          <icosahedronGeometry args={[0.32, 1]} />
          <meshBasicMaterial color="#7ff5e8" wireframe transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={scanLine} position={[0, 0.55, 0.06]}>
          <boxGeometry args={[1.05, 0.006, 0.006]} />
          <meshBasicMaterial color="#bef264" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <Label3D text="FACE SCAN" sub="LIVENESS ON" position={[0, -0.35, -0.5]} scale={0.15} accent="#bef264" />

      {/* scanner device on beam */}
      <group position={[0.55, 1.62, -0.35]} rotation={[0.5, 0, 0]}>
        <RoundedBox args={[0.22, 0.14, 0.3]} radius={0.03} smoothness={3}>
          <meshStandardMaterial color="#0d1116" roughness={0.3} metalness={0.85} />
        </RoundedBox>
        <mesh position={[0, -0.02, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.06, 20]} />
          <meshStandardMaterial color="#05070a" roughness={0.2} metalness={0.8} />
        </mesh>
        <GlowSprite position={[0, 0, 0.24]} scale={0.2} color="#67e8f9" opacity={0.5} />
      </group>

      {/* QR beacon */}
      <group ref={qr} position={[-2.15, 0.62, 0.35]}>
        <RoundedBox args={[0.58, 0.58, 0.05]} radius={0.03} smoothness={3}>
          <meshStandardMaterial color="#0b0f14" roughness={0.35} metalness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[0.48, 0.48]} />
          <meshBasicMaterial map={qrTex} transparent opacity={0.92} toneMapped={false} />
        </mesh>
        <GlowSprite position={[0, 0, -0.1]} scale={1.1} color="#67e8f9" opacity={0.14} />
      </group>
      <Label3D text="QR FALLBACK" position={[-2.15, 0.22, 0.4]} scale={0.11} mono />

      {/* analytics panels */}
      {[
        { p: [2.2, 0.95, -0.3] as const, r: -0.5 },
        { p: [2.35, 0.15, -0.1] as const, r: -0.6 },
      ].map((cfg, i) => (
        <group key={i} position={cfg.p as unknown as THREE.Vector3Tuple} rotation={[0, cfg.r, 0]}>
          <RoundedBox args={[0.92, 0.56, 0.05]} radius={0.03} smoothness={3}>
            <meshPhysicalMaterial color="#0b0f14" roughness={0.25} metalness={0.45} clearcoat={0.7} transparent opacity={0.95} />
          </RoundedBox>
          <mesh position={[0, 0, 0.028]}>
            <planeGeometry args={[0.8, 0.44]} />
            <meshStandardMaterial
              map={dash}
              emissive="#ffffff"
              emissiveMap={dash}
              emissiveIntensity={1.1}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* geofence ring on floor */}
      <mesh ref={geoRing} position={[0, -0.79, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.008, 8, 96]} />
        <meshBasicMaterial color="#bef264" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.785, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 2.3]} />
        <meshBasicMaterial map={glow} color="#0e3a40" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* floor */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial map={grid} color="#0a0d10" roughness={0.3} metalness={0.6} />
      </mesh>

      <ParticleField count={110} spread={[9, 5, 8]} size={0.022} color="#7fd8e8" opacity={0.28} speed={0.015} seed={51} />

      <spotLight position={[1.8, 4, 3]} angle={0.65} penumbra={1} intensity={60} color="#dbeaff" distance={16} decay={2} />
      <spotLight position={[-3.4, 2, -2]} angle={0.7} penumbra={1} intensity={30} color="#67e8f9" distance={14} decay={2} />
      <pointLight position={[0, 0.8, 3.6]} intensity={5} color="#8fd8e8" distance={10} decay={2} />
      <ambientLight intensity={0.22} />
    </group>
  )
}
