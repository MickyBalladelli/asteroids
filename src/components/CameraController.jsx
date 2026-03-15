import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _offset = new THREE.Vector3()

const MIN_SAFE_DISTANCE = 2
const DEFAULT_FOLLOW_DISTANCE = 16

function CameraController({ selectedAsteroid, positionsRef, ...orbitProps }) {
  const controlsRef = useRef()
  const prevIdRef = useRef(null)
  const transitioningRef = useRef(false)
  const followDistRef = useRef(DEFAULT_FOLLOW_DISTANCE)

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const id = selectedAsteroid?.id ?? null
    if (id !== prevIdRef.current) {
      const isNewSelection = Boolean(id)
      prevIdRef.current = id
      transitioningRef.current = isNewSelection
      if (isNewSelection) {
        followDistRef.current = DEFAULT_FOLLOW_DISTANCE
      }
    }

    controls.enablePan = id ? false : (orbitProps.enablePan ?? true)

    if (!id) {
      controls.update()
      return
    }

    const targetPos = positionsRef.current?.[id]
    if (!targetPos) {
      controls.update()
      return
    }

    // Let OrbitControls process zoom/rotate input first
    controls.update()

    // Read the distance OrbitControls settled on (reflects user zoom)
    const currentDist = state.camera.position.distanceTo(controls.target)
    followDistRef.current = Math.max(currentDist, MIN_SAFE_DISTANCE)

    // Compute viewing direction from current camera orientation
    _offset.copy(state.camera.position).sub(controls.target)
    if (_offset.lengthSq() < 1e-6) {
      _offset.set(0, 1.6, 8)
    }
    _offset.normalize().multiplyScalar(followDistRef.current)

    const camera = state.camera
    const t = 1 - Math.pow(0.03, delta)

    // Move target to follow the asteroid
    if (transitioningRef.current) {
      controls.target.lerp(targetPos, t)
      if (controls.target.distanceTo(targetPos) < 0.02) {
        controls.target.copy(targetPos)
        transitioningRef.current = false
      }
    } else {
      controls.target.copy(targetPos)
    }

    // Position camera at the preserved distance / angle from the new target
    camera.position.copy(controls.target).add(_offset)
    camera.lookAt(controls.target)

    // Sync OrbitControls' internal state so it doesn't fight us next frame
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
