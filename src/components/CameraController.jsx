import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _offset = new THREE.Vector3()

function CameraController({ selectedAsteroid, positionsRef, ...orbitProps }) {
  const controlsRef = useRef()
  const animatingRef = useRef(false)
  const prevIdRef = useRef(null)

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const id = selectedAsteroid?.id ?? null
    if (id !== prevIdRef.current) {
      prevIdRef.current = id
      if (id) animatingRef.current = true
    }

    if (!animatingRef.current || !id) return
    const targetPos = positionsRef.current?.[id]
    if (!targetPos) return

    const camera = state.camera
    const t = 1 - Math.pow(0.05, delta)

    _offset.copy(camera.position).sub(controls.target)
    controls.target.lerp(targetPos, t)
    camera.position.copy(controls.target).add(_offset)
    controls.update()

    if (controls.target.distanceTo(targetPos) < 0.05) {
      animatingRef.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      {...orbitProps}
    />
  )
}

export default CameraController
