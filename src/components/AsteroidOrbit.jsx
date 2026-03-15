import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { sampleOrbit } from '../utils/orbitMath'
import { threatColor as getThreatColor } from '../utils/threatScore'

function AsteroidOrbit({ orbit, hazardMode, hazardous, isSelected, threatScore }) {
  const geometry = useMemo(() => {
    const points = sampleOrbit(orbit, 96)
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [orbit])

  const color = useMemo(() => {
    if (isSelected) return new THREE.Color('#65f9ff')
    if (hazardMode) return new THREE.Color(getThreatColor(threatScore || 0))
    return new THREE.Color(hazardous ? '#f37b7b' : '#86b0ff')
  }, [hazardMode, hazardous, isSelected, threatScore])

  const opacity = isSelected ? 0.95 : hazardMode ? 0.45 : 0.25

  return (
    <line geometry={geometry} frustumCulled={false} raycast={() => null}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </line>
  )
}

export default memo(AsteroidOrbit)
