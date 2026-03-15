import { Text } from '@react-three/drei';
import { memo, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { distanceScaling, pointOnOrbit } from '../utils/orbitMath';
import AsteroidTrail from './AsteroidTrail';

function Asteroid({ asteroid, hazardMode, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [trailPosition, setTrailPosition] = useState(null);
  const tRef = useRef(Math.random());

  const baseColor = asteroid.hazardous ? '#ff5c5c' : '#f4f7ff';
  const radarColor = asteroid.hazardous ? '#ff2222' : '#44506e';

  const size = useMemo(
    () => THREE.MathUtils.clamp(0.03 + Math.sqrt(asteroid.diameterKm) * 0.09, 0.035, 0.19),
    [asteroid.diameterKm]
  );

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * asteroid.orbit.angularSpeed) % 1;
    const pos = pointOnOrbit(asteroid.orbit, tRef.current);

    if (meshRef.current) {
      const { scaleBoost, glowBoost } = distanceScaling(pos, asteroid.orbit.approachStrength);
      const intensity = hazardMode
        ? asteroid.hazardous
          ? 0.7 + glowBoost
          : 0.08
        : 0.2 + glowBoost * 0.35;

      meshRef.current.position.copy(pos);
      meshRef.current.scale.setScalar(size * (1 + scaleBoost * 0.5));
      meshRef.current.material.emissiveIntensity = intensity;
    }

    setTrailPosition(pos);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(asteroid);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial
          color={hazardMode ? radarColor : baseColor}
          roughness={0.35}
          metalness={0.12}
          emissive={hazardMode && asteroid.hazardous ? '#ff1515' : '#526cff'}
          emissiveIntensity={0.25}
        />
      </mesh>

      {hovered && meshRef.current && (
        <Text
          position={[meshRef.current.position.x, meshRef.current.position.y + 0.22, meshRef.current.position.z]}
          fontSize={0.14}
          color="#f3f6ff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.006}
          outlineColor="#03050d"
        >
          {asteroid.name}
        </Text>
      )}

      <AsteroidTrail
        color={hazardMode && asteroid.hazardous ? '#ff4d4d' : '#8bb8ff'}
        currentPosition={trailPosition}
      />
    </group>
  );
}

export default memo(Asteroid);
