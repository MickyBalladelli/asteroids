import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAsteroidsByRange } from '../utils/api'
import { buildOrbitFromAsteroid, isEarthCrossing } from '../utils/orbitMath'
import { computeThreatScore } from '../utils/threatScore'

function normalizeAsteroid(item, atScale) {
  const approach = item.close_approach_data?.[0] || {}
  const diameterMin =
    item.estimated_diameter?.kilometers?.estimated_diameter_min || 0
  const diameterMax =
    item.estimated_diameter?.kilometers?.estimated_diameter_max || 0

  const asteroid = {
    id: item.id,
    name: item.name,
    hazardous: item.is_potentially_hazardous_asteroid,
    diameterKm: (diameterMin + diameterMax) / 2,
    velocityKph: Number(approach.relative_velocity?.kilometers_per_hour || 0),
    missDistanceKm: Number(approach.miss_distance?.kilometers || 0),
    closeApproachDate: approach.close_approach_date || 'Unknown',
  }

  return {
    ...asteroid,
    threatScore: computeThreatScore(asteroid),
    earthCrossing: isEarthCrossing(asteroid),
    orbit: buildOrbitFromAsteroid(asteroid, atScale),
  }
}

export default function useAsteroids(daysAhead, atScale = true) {
  const [asteroids, setAsteroids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAsteroids = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAsteroidsByRange(daysAhead)
      const grouped = response.near_earth_objects || {}
      const normalized = Object.values(grouped)
        .flat()
        .map((item) => normalizeAsteroid(item, atScale))
        .sort((a, b) => a.missDistanceKm - b.missDistanceKm)

      const nearby = normalized.filter((asteroid) => asteroid.missDistanceKm <= 1200000)
      const prioritized = atScale
        ? (nearby.length >= 24 ? nearby : normalized).slice(0, 100)
        : normalized.slice(0, 100)

      setAsteroids(prioritized)
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to fetch asteroid data')
      setAsteroids([])
    } finally {
      setLoading(false)
    }
  }, [atScale, daysAhead])

  useEffect(() => {
    loadAsteroids()
  }, [loadAsteroids])

  const stats = useMemo(() => {
    const hazardousCount = asteroids.filter(
      (asteroid) => asteroid.hazardous,
    ).length
    const earthCrossingCount = asteroids.filter(
      (asteroid) => asteroid.earthCrossing,
    ).length
    return {
      total: asteroids.length,
      hazardous: hazardousCount,
      safe: Math.max(asteroids.length - hazardousCount, 0),
      earthCrossing: earthCrossingCount,
    }
  }, [asteroids])

  return {
    asteroids,
    loading,
    error,
    stats,
    refetch: loadAsteroids,
  }
}
