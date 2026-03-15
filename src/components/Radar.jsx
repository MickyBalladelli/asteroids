import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// Pulse ring driven by max threat score for urgency feel
function RadarRing({ delay, speed, color }) {
  const ringRef = useRef()

  useFrame(({ clock }) => {
    const elapsed = (clock.getElapsedTime() * speed + delay) % 1
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
        color={color}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Static Earth-centered hazard zone bands
function HazardZone({ innerRadius, outerRadius, color, opacity }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} raycast={() => null}>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Radar({ enabled, maxThreatScore }) {
  const delays = useMemo(() => [0, 0.33, 0.66], [])

  // Pulse speed scales with threat: low threat = slow, critical = fast
  const pulseSpeed = useMemo(() => {
    if (!maxThreatScore) return 0.28
    if (maxThreatScore >= 70) return 0.55
    if (maxThreatScore >= 45) return 0.42
    if (maxThreatScore >= 20) return 0.32
    return 0.22
  }, [maxThreatScore])

  // Pulse color from threat level
  const pulseColor = useMemo(() => {
    if (!maxThreatScore) return '#ff3c3c'
    if (maxThreatScore >= 70) return '#ff2222'
    if (maxThreatScore >= 45) return '#ff6622'
    if (maxThreatScore >= 20) return '#ffaa22'
    return '#44cc66'
  }, [maxThreatScore])

  if (!enabled) {
    return null
  }

  return (
    <group>
      {/* Hazard zone bands around Earth */}
      <HazardZone innerRadius={1.6} outerRadius={4.0} color="#44cc66" opacity={0.045} />
      <HazardZone innerRadius={4.0} outerRadius={8.0} color="#ffcc33" opacity={0.035} />
      <HazardZone innerRadius={8.0} outerRadius={14.0} color="#ff6622" opacity={0.03} />

      {/* Threat-driven radar pulses */}
      {delays.map((delay) => (
        <RadarRing key={delay} delay={delay} speed={pulseSpeed} color={pulseColor} />
      ))}
    </group>
  )
}

export default Radar
