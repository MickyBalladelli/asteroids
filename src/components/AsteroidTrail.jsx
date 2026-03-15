import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function AsteroidTrail({ color, currentPosition, maxLength = 34 }) {
  const historyRef = useRef([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!currentPosition) {
      return;
    }

    historyRef.current.push(currentPosition.clone());
    if (historyRef.current.length > maxLength) {
      historyRef.current.shift();
    }

    forceTick((tick) => (tick + 1) % 10000);
  }, [currentPosition, maxLength]);

  const points = historyRef.current;

  const trailColor = useMemo(() => new THREE.Color(color), [color]);

  if (points.length < 3) {
    return null;
  }

  return (
    <Line
      points={points}
      color={trailColor}
      transparent
      opacity={0.25}
      linewidth={1}
      blending={THREE.AdditiveBlending}
    />
  );
}

export default AsteroidTrail;
