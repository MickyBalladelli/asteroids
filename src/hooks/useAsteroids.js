import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAsteroidsByRange } from '../utils/api';
import { buildOrbitFromAsteroid } from '../utils/orbitMath';

function normalizeAsteroid(item) {
  const approach = item.close_approach_data?.[0] || {};
  const diameterMin = item.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
  const diameterMax = item.estimated_diameter?.kilometers?.estimated_diameter_max || 0;

  const asteroid = {
    id: item.id,
    name: item.name,
    hazardous: item.is_potentially_hazardous_asteroid,
    diameterKm: (diameterMin + diameterMax) / 2,
    velocityKph: Number(approach.relative_velocity?.kilometers_per_hour || 0),
    missDistanceKm: Number(approach.miss_distance?.kilometers || 0),
    closeApproachDate: approach.close_approach_date || 'Unknown'
  };

  return {
    ...asteroid,
    orbit: buildOrbitFromAsteroid(asteroid)
  };
}

export default function useAsteroids(daysAhead) {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAsteroids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAsteroidsByRange(daysAhead);
      const grouped = response.near_earth_objects || {};
      const normalized = Object.values(grouped)
        .flat()
        .map(normalizeAsteroid)
        .slice(0, 280);

      setAsteroids(normalized);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to fetch asteroid data');
      setAsteroids([]);
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    loadAsteroids();
  }, [loadAsteroids]);

  const stats = useMemo(() => {
    const hazardousCount = asteroids.filter((asteroid) => asteroid.hazardous).length;
    return {
      total: asteroids.length,
      hazardous: hazardousCount,
      safe: Math.max(asteroids.length - hazardousCount, 0)
    };
  }, [asteroids]);

  return {
    asteroids,
    loading,
    error,
    stats,
    refetch: loadAsteroids
  };
}
