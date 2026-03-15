import * as THREE from 'three';

const TAU = Math.PI * 2;

const hashToUnit = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
};

export function buildOrbitFromAsteroid(asteroid) {
  const seedA = hashToUnit(`${asteroid.id}-a`);
  const seedB = hashToUnit(`${asteroid.id}-b`);
  const seedC = hashToUnit(`${asteroid.id}-c`);

  const missKm = asteroid.missDistanceKm || 1000000;
  const velocity = asteroid.velocityKph || 10000;

  const semiMajor = THREE.MathUtils.clamp(3 + Math.log10(missKm + 1000) * 0.5 + seedA * 3, 4.2, 14);
  const eccentricity = THREE.MathUtils.clamp(0.12 + seedB * 0.5, 0.1, 0.65);
  const inclination = (seedC - 0.5) * 1.1;
  const phase = seedA * TAU;
  const angularSpeed = THREE.MathUtils.clamp((velocity / 65000) * 0.05, 0.005, 0.09);
  const approachStrength = THREE.MathUtils.clamp(1 / (missKm / 750000 + 1), 0.15, 1);

  return {
    semiMajor,
    eccentricity,
    inclination,
    phase,
    angularSpeed,
    approachStrength
  };
}

export function pointOnOrbit(orbit, t) {
  const theta = t * TAU + orbit.phase;
  const radius = (orbit.semiMajor * (1 - orbit.eccentricity ** 2)) / (1 + orbit.eccentricity * Math.cos(theta));

  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  const y = Math.sin(theta * 1.7 + orbit.phase) * orbit.inclination;

  return new THREE.Vector3(x, y, z);
}

export function sampleOrbit(orbit, segments = 180) {
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    points.push(pointOnOrbit(orbit, i / segments));
  }
  return points;
}

export function distanceScaling(position, approachStrength) {
  const dist = position.length();
  const scaleBoost = THREE.MathUtils.clamp((1 / (dist + 0.2)) * 4 * approachStrength, 0.35, 2.3);
  const glowBoost = THREE.MathUtils.clamp((1 / (dist + 0.2)) * 2.8, 0.2, 1.9);
  return { scaleBoost, glowBoost };
}
