import { memo, useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as satellite from 'satellite.js'

const KM_TO_UNITS = 1.5 / 6371

// Shared geometries (created once, reused for every satellite)
const BODY_GEO = new THREE.BoxGeometry(0.055, 0.022, 0.022)
const PANEL_GEO = new THREE.BoxGeometry(0.07, 0.002, 0.028)
const DISH_GEO = new THREE.CylinderGeometry(0.008, 0.012, 0.005, 8)
const HIT_GEO = new THREE.SphereGeometry(0.06, 6, 6)

// Body: silver-grey hull
const bodyMat = new THREE.MeshStandardMaterial({ color: '#b0bec5', roughness: 0.55, metalness: 0.7 })
const bodyMatSel = new THREE.MeshStandardMaterial({ color: '#65f9ff', roughness: 0.4, metalness: 0.8, emissive: '#65f9ff', emissiveIntensity: 0.35 })
// Solar panels: dark blue iridescent
const panelMat = new THREE.MeshStandardMaterial({ color: '#1a237e', roughness: 0.3, metalness: 0.6, emissive: '#3949ab', emissiveIntensity: 0.25 })
const panelMatSel = new THREE.MeshStandardMaterial({ color: '#0d47a1', roughness: 0.25, metalness: 0.7, emissive: '#42a5f5', emissiveIntensity: 0.5 })
// Dish: white ceramic
const dishMat = new THREE.MeshStandardMaterial({ color: '#e0e0e0', roughness: 0.6, metalness: 0.2 })

function eciToVec3(pos) {
  return new THREE.Vector3(
    pos.x * KM_TO_UNITS,
    pos.z * KM_TO_UNITS,
    -pos.y * KM_TO_UNITS,
  )
}

// Satellite model: rectangular body + two solar panel wings + small dish
function SatelliteModel({ isSelected }) {
  const bMat = isSelected ? bodyMatSel : bodyMat
  const pMat = isSelected ? panelMatSel : panelMat
  return (
    <group>
      {/* Main body */}
      <mesh geometry={BODY_GEO} material={bMat} />
      {/* Left solar panel */}
      <mesh geometry={PANEL_GEO} material={pMat} position={[-0.0625, 0.012, 0]} />
      {/* Right solar panel */}
      <mesh geometry={PANEL_GEO} material={pMat} position={[0.0625, 0.012, 0]} />
      {/* Comm dish on top */}
      <mesh geometry={DISH_GEO} material={dishMat} position={[0, 0.016, 0]} />
    </group>
  )
}

const SatelliteDot = memo(function SatelliteDot({ sat, isSelected, onSelect, satellitePositionsRef, simTimeRef, onHover, onHoverOut }) {
  const groupRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)

  const orbitPoints = useMemo(
    () => sat.orbitPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [sat.orbitPoints],
  )
  const orbitGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(orbitPoints),
    [orbitPoints],
  )

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const simDate = new Date(simTimeRef ? simTimeRef.current : Date.now())
    const pv = satellite.propagate(sat.satrec, simDate)
    if (!pv?.position) return
    const pos = eciToVec3(pv.position)
    groupRef.current.position.copy(pos)
    // Slowly tumble so solar panels are visible from any angle
    angleRef.current += delta * 0.4
    groupRef.current.rotation.y = angleRef.current
    if (satellitePositionsRef) {
      satellitePositionsRef.current[sat.id] = pos.clone()
    }
  })

  const handleClick = useCallback(
    (e) => { e.stopPropagation(); onSelect(sat) },
    [sat, onSelect],
  )

  return (
    <group>
      <line geometry={orbitGeo} frustumCulled={false} raycast={() => null}>
        <lineBasicMaterial
          color={isSelected ? '#65f9ff' : '#00e5b0'}
          transparent
          opacity={isSelected ? 0.75 : 0.22}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </line>

      {/* Invisible sphere as generous click target */}
      <mesh ref={groupRef} frustumCulled={false} onClick={handleClick}>
        <mesh
          geometry={HIT_GEO}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover && onHover(sat) }}
          onPointerMove={() => { onHover && onHover(sat) }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; onHoverOut && onHoverOut() }}
        >
          <meshBasicMaterial visible={false} />
        </mesh>
        <SatelliteModel isSelected={isSelected} />
      </mesh>
    </group>
  )
})

function SatelliteLayer({ satellites, selectedId, onSelect, satellitePositionsRef, simTimeRef, onHover, onHoverOut }) {
  if (!satellites.length) return null
  return (
    <group>
      {satellites.map((sat) => (
        <SatelliteDot
          key={sat.id}
          sat={sat}
          isSelected={sat.id === selectedId}
          onSelect={onSelect}
          satellitePositionsRef={satellitePositionsRef}
          simTimeRef={simTimeRef}
          onHover={onHover}
          onHoverOut={onHoverOut}
        />
      ))}
    </group>
  )
}

export default memo(SatelliteLayer)

