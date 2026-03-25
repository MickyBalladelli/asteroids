import { useEffect, useRef, useState } from 'react'
import * as satellite from 'satellite.js'
import { fetchSatelliteGroup } from '../utils/satelliteApi'

const KM_TO_UNITS = 1.5 / 6371
const SAMPLE_SEGMENTS = 96
const MU_KM3_S2 = 398600.4418  // Earth gravitational parameter (km³/s²)
const EARTH_RADIUS_KM = 6371

function sampleOrbitPoints(satrec) {
  const periodMin = (2 * Math.PI) / satrec.no
  const now = new Date()
  const points = []
  for (let i = 0; i <= SAMPLE_SEGMENTS; i += 1) {
    const t = new Date(now.getTime() + (i / SAMPLE_SEGMENTS) * periodMin * 60000)
    const pv = satellite.propagate(satrec, t)
    if (pv && pv.position) {
      const { x, y, z } = pv.position
      points.push([x * KM_TO_UNITS, z * KM_TO_UNITS, -y * KM_TO_UNITS])
    }
  }
  return points
}

function deriveOrbitalParams(satrec) {
  const nRadPerSec = satrec.no / 60
  const semiMajorKm = Math.cbrt(MU_KM3_S2 / (nRadPerSec * nRadPerSec))
  const altitudeKm = Math.round(semiMajorKm - EARTH_RADIUS_KM)
  const periodMin = Math.round((2 * Math.PI) / satrec.no)
  const R2D = 180 / Math.PI
  const inclinationDeg = (satrec.inclo * R2D).toFixed(2)
  const eccentricity = satrec.ecco.toFixed(6)
  const raanDeg = (satrec.nodeo * R2D).toFixed(2)
  const argPerigeeDeg = (satrec.argpo * R2D).toFixed(2)
  const meanAnomalyDeg = (satrec.mo * R2D).toFixed(2)
  const revNumber = satrec.revnum
  const bstar = satrec.bstar.toExponential(4)
  const classification =
    satrec.classification === 'U' ? 'Unclassified'
    : satrec.classification === 'C' ? 'Classified'
    : satrec.classification === 'S' ? 'Secret'
    : satrec.classification || 'Unknown'
  const intlDesignator = (satrec.intldesg || '').trim()

  const ey = satrec.epochyr
  const epochYear = ey < 57 ? 2000 + ey : 1900 + ey
  const epochDate = new Date(Date.UTC(epochYear, 0, 1))
  epochDate.setUTCDate(epochDate.getUTCDate() + Math.floor(satrec.epochdays - 1))
  const epoch = epochDate.toISOString().split('T')[0]

  return {
    altitudeKm, periodMin, inclinationDeg, eccentricity,
    raanDeg, argPerigeeDeg, meanAnomalyDeg,
    revNumber, bstar, classification, intlDesignator, epoch,
  }
}

export default function useSatellites(enabled = false) {
  const [satellites, setSatellites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!enabled || hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    setError(null)

    fetchSatelliteGroup('STATIONS')
      .then((data) => {
        const normalized = data
          .map((item) => {
            const satrec = satellite.twoline2satrec(item.tle1, item.tle2)
            const noradId = item.tle2.substring(2, 7).trim()
            return {
              id: noradId,
              name: item.name,
              satrec,
              tle1: item.tle1,
              tle2: item.tle2,
              ...deriveOrbitalParams(satrec),
              orbitPoints: sampleOrbitPoints(satrec),
            }
          })
        setSatellites(normalized)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Unable to fetch satellite data')
        setLoading(false)
      })
  }, [enabled])

  return { satellites, loading, error }
}

