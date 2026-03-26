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

    controls.update()

    _offset.copy(state.camera.position).sub(controls.target)
    if (_offset.lengthSq() < 1e-6) {
      _offset.set(0, 1.6, 8)
    }
    _offset.normalize().multiplyScalar(followDistRef.current)

    const camera = state.camera
    const t = 1 - Math.pow(0.03, delta)

    if (transitioningRef.current) {
      // Lerp both orbit target and camera distance simultaneously
      controls.target.lerp(targetPos, t)
      followDistRef.current = THREE.MathUtils.lerp(followDistRef.current, targetFollowDistRef.current, t)
      const donePos = controls.target.distanceTo(targetPos) < 0.02
      const doneDist = Math.abs(followDistRef.current - targetFollowDistRef.current) < 0.05
      if (donePos && doneDist) {
        controls.target.copy(targetPos)
        followDistRef.current = targetFollowDistRef.current
        transitioningRef.current = false
      }
    } else {
      // Track target position; let user freely adjust zoom
      controls.target.copy(targetPos)
      const currentDist = state.camera.position.distanceTo(controls.target)
      followDistRef.current = Math.max(currentDist, MIN_SAFE_DISTANCE)
    }

    camera.position.copy(controls.target).add(_offset)
    camera.lookAt(controls.target)

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
