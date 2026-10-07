'use client'

import * as THREE from 'three'

/**
 * Shared, mutable environment state written by scene components each frame
 * and applied to the scene graph exactly once (by EnvController, last).
 * Keeps fog/background transitions perfectly smooth across scenes.
 */
export const envBus = {
  /** scene override flag (e.g. HydroFloat underwater) */
  underwater: false,
  /** currently applied values (read by DOM if ever needed) */
  cur: new THREE.Color('#050505'),
  density: 0.045,
  /** internal damping state */
  underwaterMix: 0,
}

export const UNDERWATER_BG = new THREE.Color('#032a33')
export const UNDERWATER_DENSITY = 0.105
