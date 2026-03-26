import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _offset = new THREE.Vector3()

const MIN_SAFE_DISTANCE = 2
const DEFAULT_FOLLOW_DISTANCE = 16
const SATELLITE_FOLLOW_DISTANCE = 2.5

function CameraController({
  selectedAsteroid,
  positionsRef,
  selectedSatellite,
  satellitePositionsRef,
  ...orbitProps
}) {
  const controlsRef = useRef()
  const prevIdRef = useRef(null)
  const transitioningRef = useRef(false)
  const followDistRef = useRef(DEFAULT_FOLLOW_DISTANCE)
  const targetFollowDistRef = useRef(DEFAULT_FOLLOW_DISTANCE)

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    // Prefer satellite target when one is selected
    const activeTarget = selectedSatellite || selectedAsteroid
    const activeRef = selectedSatellite ? satellitePositionsRef : positionsRef
    const defaultFollowDist = selectedSatellite ? SATELLITE_FOLLOW_DISTANCE : DEFAULT_FOLLOW_DISTANCE

    const id = activeTarget?.id ?? null
    if (id !== prevIdRef.current) {
      const isNewSelection = Boolean(id)
      prevIdRef.current = id
      transitioningRef.current = isNewSelection
      if (isNewSelection) {
        // Start from current distance and animate toward the desired follow distance
        followDistRef.current = state.camera.position.distanceTo(controls.target)
        targetFollowDistRef.current = defaultFollowDist
      }
    }

    controls.enablePan = id ? false : (orbitProps.enablePan ?? true)

    if (!id) {
      controls.update()
      return
    }

    const targetPos = activeRef?.current?.[id]
    if (!targetPos) {
      controls.update()
      return
    }

    const camera = state.camera
    const t = 1 - Math.pow(0.03, delta)

    if (transitioningRef.current) {
      // Lerp orbit target and zoom distance simultaneously
      controls.target.lerp(targetPos, t)
      followDistRef.current = THREE.MathUtils.lerp(followDistRef.current, targetFollowDistRef.current, t)

      // Reposition camera along current direction at lerped distance
      _offset.copy(camera.position).sub(controls.target)
      if (_offset.lengthSq() < 1e-6) _offset.set(0, 1.6, 8)
      _offset.normalize().multiplyScalar(followDistRef.current)
      camera.position.copy(controls.target).add(_offset)

      // Finish transition once the camera is close enough to the desired
      // follow distance — checked against the satellite, not controls.target,
      // so a fast-moving satellite can't prevent the transition from ending.
      const camSatDist = camera.position.distanceTo(targetPos)
      if (Math.abs(camSatDist - targetFollowDistRef.current) < 0.4) {
        transitioningRef.current = false
      }
    } else {
      // Translate camera + target together by the satellite's frame delta.
      // This preserves the user's zoom distance and orbit angle exactly,
      // and lets OrbitControls process scroll on top in controls.update().
      _offset.copy(targetPos).sub(controls.target)
      controls.target.copy(targetPos)
      camera.position.add(_offset)
    }

    // Single controls.update() — applies user scroll/orbit input and
    // syncs OrbitControls' internal state to our manually set positions.
    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      {...orbitProps}
    />
  )
}

export default CameraController
