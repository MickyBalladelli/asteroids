import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS } from '../utils/orbitMath'

const EARTH_RADIUS_KM = 6371
const KM_PER_UNIT = EARTH_RADIUS_KM / EARTH_RADIUS_UNITS

function DistanceLine({ positionsRef, selectedId, selectedName }) {
  const lineRef = useRef()
  const groupRef = useRef()
  const labelGroupRef = useRef()
  const textRef = useRef()

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3),
    )
    return g
  }, [])

  useFrame(() => {
    if (!selectedId || !positionsRef.current?.[selectedId]) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }

    const pos = positionsRef.current[selectedId]
    const attr = geom.attributes.position

    attr.setXYZ(0, 0, 0, 0)
    attr.setXYZ(1, pos.x, pos.y, pos.z)
    attr.needsUpdate = true

    if (groupRef.current) groupRef.current.visible = true

    if (lineRef.current) {
      lineRef.current.computeLineDistances()
    }

    // Place label group at asteroid position — pixel offset handled in CSS
    if (labelGroupRef.current) {
      labelGroupRef.current.position.set(pos.x, pos.y, pos.z)
    }

    const distUnits = pos.length()
    const distKm = distUnits * KM_PER_UNIT
    if (textRef.current) {
      if (distKm > 1e6) {
        textRef.current.textContent = `${(distKm / 1e6).toFixed(2)} M km`
      } else {
        textRef.current.textContent = `${Math.round(distKm).toLocaleString()} km`
      }
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <line ref={lineRef} geometry={geom} raycast={() => null}>
        <lineDashedMaterial
          color="#65f9ff"
          transparent
          opacity={0.5}
          dashSize={0.8}
          gapSize={0.5}
          depthTest={false}
        />
      </line>
      <group ref={labelGroupRef}>
        <Html
          center
          style={{
            pointerEvents: 'none',
            transform: 'translate(0, -32px)',
          }}
          zIndexRange={[120, 0]}
          occlude={false}
        >
          <div
            style={{
              background: 'rgba(6,11,24,0.92)',
              border: '1px solid rgba(101,249,255,0.75)',
              borderRadius: 6,
              padding: '3px 9px',
              color: '#65f9ff',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              boxShadow: '0 0 10px rgba(101,249,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span
              style={{
                color: '#b8f6ff',
                fontSize: 10,
                fontWeight: 600,
                opacity: 0.95,
                letterSpacing: 0.2,
              }}
            >
              {selectedName || 'Selected Asteroid'}
            </span>
            <span ref={textRef}>—</span>
          </div>
        </Html>
      </group>
    </group>
  )
}

export default DistanceLine
