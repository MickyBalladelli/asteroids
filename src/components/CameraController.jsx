import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _offset = new THREE.Vector3()
const _desiredCameraPos = new THREE.Vector3()

const MIN_SAFE_DISTANCE = 2

function CameraController({ selectedAsteroid, positionsRef, ...orbitProps }) {
  const controlsRef = useRef()
  const prevIdRef = useRef(null)
  const transitioningRef = useRef(false)

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    // Let OrbitControls process user input first (zoom/orbit), then we recenter.
    controls.update()

    const id = selectedAsteroid?.id ?? null
    if (id !== prevIdRef.current) {
      prevIdRef.current = id
      transitioningRef.current = Boolean(id)
    }

    controls.zoomToCursor = false
    controls.enablePan = id ? false : (orbitProps.enablePan ?? true)

    if (!id) return
    const targetPos = positionsRef.current?.[id]
    if (!targetPos) return

    const camera = state.camera
    const t = 1 - Math.pow(0.03, delta)

    _offset.copy(camera.position).sub(controls.target)

    if (_offset.lengthSq() < 1e-6) {
      _offset.set(0, 1.6, 8)
    }

    const distance = _offset.length()
    if (distance < MIN_SAFE_DISTANCE) {
      _offset.multiplyScalar(MIN_SAFE_DISTANCE / Math.max(distance, 1e-6))
    }

    // Keep the selected asteroid centered while preserving user-controlled zoom/orbit offset.
    if (transitioningRef.current) {
      controls.target.lerp(targetPos, t)
      if (controls.target.distanceTo(targetPos) < 0.02) {
        controls.target.copy(targetPos)
        transitioningRef.current = false
      }
    } else {
      controls.target.copy(targetPos)
    }

    _desiredCameraPos.copy(controls.target).add(_offset)

    if (transitioningRef.current) {
      camera.position.lerp(_desiredCameraPos, t)
    } else {
      camera.position.copy(_desiredCameraPos)
    }

    camera.lookAt(controls.target)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      {...orbitProps}
    />
  )
}

export default CameraController
