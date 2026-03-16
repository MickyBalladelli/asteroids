import { memo, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { sampleOrbit } from '../utils/orbitMath'
import { threatColor as getThreatColor } from '../utils/threatScore'

function AsteroidOrbit({
  asteroid,
  orbit,
  hazardMode,
  hazardous,
  isSelected,
  threatScore,
  onSelect,
}) {
  const points = useMemo(() => sampleOrbit(orbit, 96), [orbit])

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  // Invisible wider tube for easier click target
  const tubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points, true)
    return new THREE.TubeGeometry(curve, 96, 0.15, 4, true)
  }, [points])

  const color = useMemo(() => {
    if (isSelected) return new THREE.Color('#65f9ff')
    if (hazardMode) return new THREE.Color(getThreatColor(threatScore || 0))
    return new THREE.Color(hazardous ? '#f37b7b' : '#86b0ff')
  }, [hazardMode, hazardous, isSelected, threatScore])

  const opacity = isSelected ? 0.95 : hazardMode ? 0.45 : 0.25

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation()
      onSelect(asteroid)
    },
    [asteroid, onSelect],
  )

  return (
    <group>
      <line geometry={lineGeometry} frustumCulled={false} raycast={() => null}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </line>
      <mesh
        geometry={tubeGeometry}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

export default memo(AsteroidOrbit)
