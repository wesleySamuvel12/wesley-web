'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { SCENES, clamp01, easeInOut } from '@/lib/scenes'
import { getScrollState } from '@/lib/scrollEngine'
import { useExperienceStore } from '@/lib/store'
import { input, updateInput } from '@/lib/input'
import { getCreativePose } from './scenes/creativeLayout'
import { getWebPose } from './scenes/webLayout'
import { getHardwarePose } from './scenes/hardwareLayout'

const _from = new THREE.Vector3()
const _to = new THREE.Vector3()
const _targetPos = new THREE.Vector3()
const _targetLook = new THREE.Vector3()
const _curLook = new THREE.Vector3(0, 0, 0)
const _posePos = new THREE.Vector3()
const _poseLook = new THREE.Vector3()

function damp3(cur: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt)
  cur.x += (target.x - cur.x) * k
  cur.y += (target.y - cur.y) * k
  cur.z += (target.z - cur.z) * k
}

export default function CameraController() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const curPos = useRef(new THREE.Vector3(0, 0.15, 9))
  const curFov = useRef(42)
  const focusAmt = useRef(0)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    updateInput(delta)
    const s = getScrollState()
    const idx = Math.min(s.sceneIndex, SCENES.length - 1)
    const cfg = SCENES[idx]
    if (!cfg) return
    const t = easeInOut(clamp01(s.sceneLocal))

    _from.set(...cfg.cam.from.pos)
    _to.set(...cfg.cam.to.pos)
    _targetPos.copy(_from).lerp(_to, t)

    _from.set(...cfg.cam.from.look)
    _to.set(...cfg.cam.to.look)
    _targetLook.copy(_from).lerp(_to, t)

    // portrait screens: pull the camera back and widen the lens so the
    // environments keep their framing on narrow viewports
    const aspect = size.width / Math.max(1, size.height)
    let fovBoost = 0
    if (aspect < 0.85) {
      _targetPos.sub(_targetLook).multiplyScalar(1.62).add(_targetLook)
      fovBoost = 10
    }

    const targetFov = cfg.cam.from.fov + (cfg.cam.to.fov - cfg.cam.from.fov) * t + fovBoost

    // click-focus zooms: creative gallery display / live web window / lab component.
    // Only one kind can be armed at a time (the store clears siblings).
    const st = useExperienceStore.getState()
    let special = false
    if (st.focusedCreative && getCreativePose(st.focusedCreative, _posePos, _poseLook)) {
      special = true
    } else if (st.focusedWeb && getWebPose(st.focusedWeb, _posePos, _poseLook)) {
      special = true
    } else if (st.focusedHardware && getHardwarePose(st.focusedHardware, _posePos, _poseLook)) {
      special = true
    }
    focusAmt.current = THREE.MathUtils.damp(focusAmt.current, special ? 1 : 0, 3.4, delta)
    if (focusAmt.current > 0.001 && special) {
      _targetPos.lerp(_posePos, focusAmt.current)
      _targetLook.lerp(_poseLook, focusAmt.current)
    }

    // subtle mouse parallax
    _targetPos.x += input.mx * 0.28
    _targetPos.y += -input.my * 0.16
    _targetLook.x += input.mx * 0.42
    _targetLook.y += -input.my * 0.26

    damp3(curPos.current, _targetPos, 2.6, delta)
    damp3(_curLook, _targetLook, 2.6, delta)

    camera.position.copy(curPos.current)
    camera.lookAt(_curLook)

    const cam = camera as THREE.PerspectiveCamera
    if (Math.abs(cam.fov - targetFov) > 0.005) {
      curFov.current = THREE.MathUtils.damp(curFov.current, targetFov, 2.6, delta)
      cam.fov = curFov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
