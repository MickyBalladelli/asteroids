import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function RadarRing({ delay }) {
  const ringRef = useRef()

  useFrame(({ clock }) => {
    const elapsed = (clock.getElapsedTime() * 0.28 + delay) % 1
    const scale = 1 + elapsed * 16
    const alpha = 1 - elapsed

    if (ringRef.current) {
      ringRef.current.scale.set(scale, scale, 1)
      ringRef.current.material.opacity = alpha * 0.24
    }
  })

  return (
    <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
      <ringGeometry args={[1.58, 1.72, 96]} />
      <meshBasicMaterial
        color="#ff3c3c"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function Radar({ enabled }) {
  const delays = useMemo(() => [0, 0.33, 0.66], [])

  if (!enabled) {
    return null
  }

  return (
    <group>
      {delays.map((delay) => (
        <RadarRing key={delay} delay={delay} />
      ))}
    </group>
  )
}

export default Radar
