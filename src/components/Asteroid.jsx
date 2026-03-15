import { memo, useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointOnOrbitTo } from '../utils/orbitMath'
import AsteroidTrail from './AsteroidTrail'

function Asteroid({ asteroid, hazardMode, onSelect }) {
  const meshRef = useRef()
  const positionRef = useRef(new THREE.Vector3())
  const tRef = useRef(Math.random())
  const smoothScaleRef = useRef(0.1)
  const smoothEmissiveRef = useRef(0.25)

  const baseColor = asteroid.hazardous ? '#ff5c5c' : '#f4f7ff'
  const radarColor = asteroid.hazardous ? '#ff2222' : '#44506e'

  const size = useMemo(
    () =>
      THREE.MathUtils.clamp(
        0.03 + Math.sqrt(asteroid.diameterKm) * 0.09,
        0.035,
        0.19,
      ),
    [asteroid.diameterKm],
  )

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * asteroid.orbit.angularSpeed) % 1
    pointOnOrbitTo(asteroid.orbit, tRef.current, positionRef.current)
    const pos = positionRef.current

    if (meshRef.current) {
      const dist = pos.length()
      const scaleBoost = THREE.MathUtils.clamp(
        (1 / (dist + 0.2)) * 4 * asteroid.orbit.approachStrength,
        0.35,
        2.3,
      )
      const glowBoost = THREE.MathUtils.clamp(
        (1 / (dist + 0.2)) * 2.8,
        0.2,
        1.9,
      )
      const intensity = hazardMode
        ? asteroid.hazardous
          ? 0.7 + glowBoost
          : 0.08
        : 0.2 + glowBoost * 0.35
      const targetScale = size * (1 + scaleBoost * 0.5)

      smoothScaleRef.current = THREE.MathUtils.lerp(
        smoothScaleRef.current,
        targetScale,
        0.14,
      )
      smoothEmissiveRef.current = THREE.MathUtils.lerp(
        smoothEmissiveRef.current,
        intensity,
        0.16,
      )

      meshRef.current.position.copy(pos)
      meshRef.current.scale.setScalar(smoothScaleRef.current)
      meshRef.current.material.emissiveIntensity = smoothEmissiveRef.current
    }
  })

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation()
      onSelect(asteroid)
    },
    [asteroid, onSelect],
  )

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color={hazardMode ? radarColor : baseColor}
          roughness={0.35}
          metalness={0.12}
          emissive={hazardMode && asteroid.hazardous ? '#ff1515' : '#526cff'}
          emissiveIntensity={0.25}
        />
      </mesh>

      <AsteroidTrail
        color={hazardMode && asteroid.hazardous ? '#ff4d4d' : '#8bb8ff'}
        currentPositionRef={positionRef}
      />
    </group>
  )
}

export default memo(Asteroid)
