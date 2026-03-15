import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS } from '../utils/orbitMath'

const EARTH_RADIUS_KM = 6371
const KM_PER_UNIT = EARTH_RADIUS_KM / EARTH_RADIUS_UNITS
const _radial = new THREE.Vector3()

function DistanceLine({ positionsRef, selectedId }) {
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

    if (labelGroupRef.current) {
      _radial.copy(pos)
      if (_radial.lengthSq() < 1e-6) {
        _radial.set(0, 1, 0)
      } else {
        _radial.normalize()
      }

      // Keep the label close to the asteroid, slightly offset outward.
      labelGroupRef.current.position.set(
        pos.x + _radial.x * 1.1,
        pos.y + _radial.y * 1.1 + 0.35,
        pos.z + _radial.z * 1.1,
      )
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
          style={{ pointerEvents: 'none' }}
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
            }}
          >
            <span ref={textRef}>—</span>
          </div>
        </Html>
      </group>
    </group>
  )
}

export default DistanceLine
