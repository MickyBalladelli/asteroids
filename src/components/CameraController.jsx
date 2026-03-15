import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _offset = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _desiredOffset = new THREE.Vector3()
const _desiredCameraPos = new THREE.Vector3()

const FOLLOW_DISTANCE = 18
const MIN_FOLLOW_DISTANCE = 8

function CameraController({ selectedAsteroid, positionsRef, ...orbitProps }) {
  const controlsRef = useRef()
  const prevIdRef = useRef(null)

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const id = selectedAsteroid?.id ?? null
    if (id !== prevIdRef.current) {
      prevIdRef.current = id
    }

    if (!id) return
    const targetPos = positionsRef.current?.[id]
    if (!targetPos) return

    const camera = state.camera
    const t = 1 - Math.pow(0.025, delta)

    _offset.copy(camera.position).sub(controls.target)
    const currentDistance = Math.max(_offset.length(), MIN_FOLLOW_DISTANCE)

    _direction.copy(_offset)
    if (_direction.lengthSq() < 1e-6) {
      _direction.set(0.32, 0.22, 1).normalize()
    } else {
      _direction.normalize()
    }

    const desiredDistance = Math.min(currentDistance, FOLLOW_DISTANCE)
    _desiredOffset.copy(_direction).multiplyScalar(Math.max(desiredDistance, MIN_FOLLOW_DISTANCE))

    controls.target.lerp(targetPos, t)
    _desiredCameraPos.copy(targetPos).add(_desiredOffset)
    camera.position.lerp(_desiredCameraPos, t)
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
