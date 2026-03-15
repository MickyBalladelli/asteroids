import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { sampleOrbit } from '../utils/orbitMath';

function AsteroidOrbit({ orbit, hazardMode, hazardous }) {
  const points = useMemo(() => sampleOrbit(orbit, 200), [orbit]);

  const color = useMemo(() => {
    if (hazardMode && hazardous) {
      return new THREE.Color('#ff4a4a');
    }

    if (hazardMode && !hazardous) {
      return new THREE.Color('#42506e');
    }

    return new THREE.Color(hazardous ? '#f37b7b' : '#86b0ff');
  }, [hazardMode, hazardous]);

  return <Line points={points} color={color} transparent opacity={hazardMode ? 0.45 : 0.25} linewidth={1} />;
}

export default AsteroidOrbit;
