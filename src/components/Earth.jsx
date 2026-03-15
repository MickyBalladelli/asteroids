import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const EARTH_DAY =
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
const EARTH_NORMAL =
  'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
const EARTH_SPEC =
  'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'

function Earth() {
  const meshRef = useRef()
  const atmosphereRef = useRef()

  const [dayMap, normalMap, specMap] = useTexture([
    EARTH_DAY,
    EARTH_NORMAL,
    EARTH_SPEC,
  ])

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color('#5db2ff') },
          viewVector: { value: new THREE.Vector3(0, 0, 1) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          uniform vec3 viewVector;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(viewVector - mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          uniform vec3 glowColor;
          void main() {
            float intensity = pow(0.82 - dot(vNormal, vView), 2.2);
            gl_FragColor = vec4(glowColor, intensity * 0.65);
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.03
      atmosphereMaterial.uniforms.viewVector.value = state.camera.position
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          map={dayMap}
          normalMap={normalMap}
          metalness={0.08}
          roughness={0.85}
          emissiveMap={specMap}
          emissive="#0d1b33"
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[1.66, 48, 48]} />
      </mesh>
    </group>
  )
}

export default Earth
