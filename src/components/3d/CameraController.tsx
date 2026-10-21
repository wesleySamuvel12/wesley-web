'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { SCENES, clamp01, easeInOut, boundaryDip } from '@/lib/scenes'
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
const _dir = new THREE.Vector3()

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
  const curRoll = useRef(0)
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
    let targetFov = cfg.cam.from.fov + (cfg.cam.to.fov - cfg.cam.from.fov) * t
    if (aspect < 0.85) {
      _targetPos.sub(_targetLook).multiplyScalar(1.52).add(_targetLook)
      targetFov += 10
    }

    // touch devices scroll natively (instant) — the rig must keep up with
    // that fast movement, so damping runs tighter than on desktop
    const isTouch = useExperienceStore.getState().isTouch

    // scroll realism — the lens reacts to scroll speed like a physical rig:
    // a gentle FOV kick and a short dolly pull-back along the view axis
    const speed = Math.min(Math.abs(s.velocity), 60)
    targetFov += speed * 0.05
    camera.getWorldDirection(_dir)
    _targetPos.addScaledVector(_dir, -Math.min(speed * 0.006, 0.4))

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
    focusAmt.current = THREE.MathUtils.damp(focusAmt.current, special ? 1 : 0, isTouch ? 4.6 : 3.4, delta)
    if (focusAmt.current > 0.001 && special) {
      _targetPos.lerp(_posePos, focusAmt.current)
      _targetLook.lerp(_poseLook, focusAmt.current)
    }

    // subtle mouse parallax
    _targetPos.x += input.mx * 0.28
    _targetPos.y += -input.my * 0.16
    _targetLook.x += input.mx * 0.42
    _targetLook.y += -input.my * 0.26

    // HARD FILM CUT — near a scene boundary the dip-to-black overlay is up,
    // so instead of damping across two worlds (which would visually mix the
    // outgoing and incoming scenes) the camera snaps while the frame is dark.
    const dip = boundaryDip(s.sceneFloat)
    if (dip > 0.9) {
      curPos.current.copy(_targetPos)
      _curLook.copy(_targetLook)
      curFov.current = targetFov
      curRoll.current = 0
    } else {
      // higher damping while inside the dip zone → the rig settles into the
      // new scene before the frame clears, so no residue is ever visible
      const lambda = (isTouch ? 3.8 : 2.6) + dip * 14
      damp3(curPos.current, _targetPos, lambda, delta)
      damp3(_curLook, _targetLook, lambda, delta)
    }

    camera.position.copy(curPos.current)
    camera.lookAt(_curLook)

    // micro roll — a whisper of banking tied to scroll direction
    const rollTarget = special ? 0 : THREE.MathUtils.clamp(-s.velocity * 0.0006, -0.02, 0.02)
    curRoll.current = THREE.MathUtils.damp(curRoll.current, rollTarget, 2.8, delta)
    if (Math.abs(curRoll.current) > 0.00005) camera.rotateZ(curRoll.current)

    const cam = camera as THREE.PerspectiveCamera
    if (Math.abs(cam.fov - targetFov) > 0.005) {
      curFov.current = THREE.MathUtils.damp(curFov.current, targetFov, 2.6, delta)
      cam.fov = curFov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
