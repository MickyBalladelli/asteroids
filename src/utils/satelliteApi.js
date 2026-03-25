import axios from 'axios'

// In dev the Vite proxy rewrites /celestrak → https://celestrak.org (avoids CORS).
// In production, celestrak.org sets Access-Control-Allow-Origin: * on this endpoint.
const GP_URL = import.meta.env.DEV
  ? '/celestrak/NORAD/elements/gp.php'
  : 'https://celestrak.org/NORAD/elements/gp.php'

/**
 * Fetch TLE data from CelesTrak and return an array of { name, tle1, tle2 } objects.
 * @param {string} group – CelesTrak group name, e.g. 'STATIONS', 'GPS-OPS'
 */
export async function fetchSatelliteGroup(group = 'STATIONS') {
  const url = `${GP_URL}?GROUP=${encodeURIComponent(group)}&FORMAT=TLE`
  const response = await axios.get(url, { timeout: 15000, responseType: 'text' })
  const lines = response.data.split('\n').map((l) => l.trim()).filter(Boolean)
  const result = []
  for (let i = 0; i + 2 < lines.length; i += 3) {
    if (lines[i + 1].startsWith('1 ') && lines[i + 2].startsWith('2 ')) {
      result.push({ name: lines[i], tle1: lines[i + 1], tle2: lines[i + 2] })
    }
  }
  return result
}
