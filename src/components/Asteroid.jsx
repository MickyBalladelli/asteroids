import { memo, useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS, pointOnOrbitTo } from '../utils/orbitMath'
import AsteroidTrail from './AsteroidTrail'

// Seed-based pseudo-random so each asteroid looks unique but stable
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function makeRockyGeometry(seed) {
  // Start from an icosahedron, displace vertices for a rough shape
  const detail = 1
  const geo = new THREE.IcosahedronGeometry(1, detail)
  const pos = geo.attributes.position
  const rng = seededRandom(seed)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const len = Math.sqrt(x * x + y * y + z * z)
    // Random displacement between 0.7 and 1.0 of original radius
    const displacement = 0.7 + rng() * 0.3
    pos.setXYZ(i, (x / len) * displacement, (y / len) * displacement, (z / len) * displacement)
  }

  geo.computeVertexNormals()
  return geo
}

function Asteroid({ asteroid, hazardMode, onSelect, isSelected, positionsRef }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const positionRef = useRef(new THREE.Vector3())
  const tRef = useRef(Math.random())
  const smoothScaleRef = useRef(0.1)
  const smoothEmissiveRef = useRef(0.25)

  // Stable seed from asteroid id
  const idSeed = useMemo(() => {
    let h = 0
    const s = asteroid.id
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i)
      h |= 0
    }
    return Math.abs(h)
  }, [asteroid.id])

  const rockyGeo = useMemo(() => makeRockyGeometry(idSeed), [idSeed])

  // Each asteroid gets a slightly different grey/brown rocky tint
  const rockyColor = useMemo(() => {
    const rng = seededRandom(idSeed + 99)
    if (asteroid.hazardous) {
      const r = 0.55 + rng() * 0.25
      const g = 0.15 + rng() * 0.1
      const b = 0.1 + rng() * 0.08
      return new THREE.Color(r, g, b)
    }
    const base = 0.28 + rng() * 0.22
    const r = base + (rng() - 0.5) * 0.08
    const g = base + (rng() - 0.5) * 0.05
    const b = base + (rng() - 0.5) * 0.03
    return new THREE.Color(r, g, b)
  }, [idSeed, asteroid.hazardous])

  const emissiveColor = asteroid.hazardous ? '#ff1515' : '#526cff'

  // Unique slow tumble rotation axis per asteroid
  const rotAxis = useMemo(() => {
    const rng = seededRandom(idSeed + 7)
    return new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize()
  }, [idSeed])
  const rotSpeed = useMemo(() => {
    const rng = seededRandom(idSeed + 13)
    return 0.15 + rng() * 0.4
  }, [idSeed])

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

    if (positionsRef) positionsRef.current[asteroid.id] = pos

    if (meshRef.current) {
      const dist = pos.length()
      const earthRadii = dist / EARTH_RADIUS_UNITS
      const scaleBoost = THREE.MathUtils.clamp(
        (1 / (earthRadii + 1)) * 36 * asteroid.orbit.approachStrength,
        0.2,
        1.85,
      )
      const glowBoost = THREE.MathUtils.clamp(
        (1 / (earthRadii + 1)) * 22,
        0.08,
        1.5,
      )
      const intensity = hazardMode
        ? asteroid.hazardous
          ? 0.7 + glowBoost
          : 0.08
        : 0.2 + glowBoost * 0.35
      const highlightedIntensity = isSelected ? intensity + 0.28 : intensity
      const targetScale = size * (1 + scaleBoost * 0.5) * (isSelected ? 1.16 : 1)

      smoothScaleRef.current = THREE.MathUtils.lerp(
        smoothScaleRef.current,
        targetScale,
        0.14,
      )
      smoothEmissiveRef.current = THREE.MathUtils.lerp(
        smoothEmissiveRef.current,
        highlightedIntensity,
        0.16,
      )

      meshRef.current.position.copy(pos)
      meshRef.current.scale.setScalar(smoothScaleRef.current)
      meshRef.current.material.emissiveIntensity = smoothEmissiveRef.current

      // Slow tumble rotation
      meshRef.current.rotateOnAxis(rotAxis, rotSpeed * delta)
    }

    // Selection glow: slightly larger wireframe shell
    if (glowRef.current) {
      glowRef.current.position.copy(pos)
      glowRef.current.scale.setScalar(smoothScaleRef.current * 1.35)
      glowRef.current.visible = isSelected
      if (isSelected) {
        glowRef.current.rotation.copy(meshRef.current.rotation)
      }
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
        geometry={rockyGeo}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={rockyColor}
          roughness={0.85}
          metalness={0.15}
          emissive={emissiveColor}
          emissiveIntensity={0.25}
          flatShading
        />
      </mesh>

      {/* Selection glow outline */}
      <mesh
        ref={glowRef}
        geometry={rockyGeo}
        visible={false}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#65F9FF"
          transparent
          opacity={0.18}
          wireframe
          depthTest={false}
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
