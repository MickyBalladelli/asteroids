import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const _delta = new THREE.Vector3()

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

  useFrame((state, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const activeTarget = selectedSatellite || selectedAsteroid
    const activeRef = selectedSatellite ? satellitePositionsRef : positionsRef

    const id = activeTarget?.id ?? null
    if (id !== prevIdRef.current) {
      prevIdRef.current = id
      transitioningRef.current = Boolean(id)
    }

    controls.enablePan = id ? false : (orbitProps.enablePan ?? true)

    if (!id) return

    const targetPos = activeRef?.current?.[id]
    if (!targetPos) return

    const camera = state.camera
    const t = 1 - Math.pow(0.03, delta)

    if (transitioningRef.current) {
      // Only lerp the orbit pivot — never touch camera.position so zoom
      // always works. The camera stays at its current world position but
      // the orbit centre smoothly moves to the selected object.
      controls.target.lerp(targetPos, t)
      if (controls.target.distanceTo(targetPos) < 0.05) {
        controls.target.copy(targetPos)
        transitioningRef.current = false
      }
    } else {
      // Rigid-body follow: translate camera + target together so the
      // camera-to-target vector (distance, angle) is fully preserved.
      // OrbitControls then applies scroll/rotate on top undisturbed.
      _delta.copy(targetPos).sub(controls.target)
      controls.target.copy(targetPos)
      camera.position.add(_delta)
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
