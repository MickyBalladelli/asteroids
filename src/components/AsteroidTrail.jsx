import { useFrame } from '@react-three/fiber'
import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'

function AsteroidTrail({ color, currentPositionRef, maxLength = 20 }) {
  const geometryRef = useRef()
  const positions = useMemo(() => new Float32Array(maxLength * 3), [maxLength])
  const trailLengthRef = useRef(0)
  const sampleAccumulator = useRef(0)

  useFrame((_, delta) => {
    if (!currentPositionRef?.current || !geometryRef.current) return

    const pos = currentPositionRef.current
    sampleAccumulator.current += delta

    if (sampleAccumulator.current >= 0.05) {
      sampleAccumulator.current = 0

      if (trailLengthRef.current >= maxLength) {
        // Native memcpy — shift all positions forward, dropping oldest
        positions.copyWithin(0, 3)
      } else {
        trailLengthRef.current += 1
        geometryRef.current.setDrawRange(0, trailLengthRef.current)
      }
    }

    // Always update the head to track the asteroid smoothly every frame
    if (trailLengthRef.current > 0) {
      const head = (trailLengthRef.current - 1) * 3
      positions[head] = pos.x
      positions[head + 1] = pos.y
      positions[head + 2] = pos.z
      geometryRef.current.attributes.position.needsUpdate = true
    }
  })

  const trailColor = useMemo(() => new THREE.Color(color), [color])

  return (
    <line frustumCulled={false} raycast={() => null}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={trailColor}
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </line>
  )
}

export default memo(AsteroidTrail)
