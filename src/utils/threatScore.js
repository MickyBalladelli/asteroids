// Compute a 0–100 threat score from asteroid properties.
// Higher score = greater potential danger.

function daysTillApproach(closeApproachDate) {
  if (!closeApproachDate || closeApproachDate === 'Unknown') return 365
  const now = new Date()
  const approach = new Date(closeApproachDate)
  const diff = (approach - now) / (1000 * 60 * 60 * 24)
  return Math.max(diff, 0)
}

export function computeThreatScore(asteroid) {
  const missKm = asteroid.missDistanceKm || 1e9
  const diameterKm = asteroid.diameterKm || 0
  const velocityKph = asteroid.velocityKph || 0
  const days = daysTillApproach(asteroid.closeApproachDate)

  // Proximity factor: closer = higher (lunar distance ~384,400 km)
  // 0 km → 1.0, 7.5M km → ~0
  const proximityScore = Math.max(0, 1 - missKm / 7500000)

  // Size factor: bigger = higher
  // 1 km → 1.0, 0.01 km → ~0.09
  const sizeScore = Math.min(Math.sqrt(diameterKm) * 1.0, 1)

  // Velocity factor: faster = higher
  // 120,000 kph → 1.0
  const velocityScore = Math.min(velocityKph / 120000, 1)

  // Urgency factor: sooner = higher
  // 0 days → 1.0, 30 days → ~0
  const urgencyScore = Math.max(0, 1 - days / 30)

  // Weighted combination
  const raw =
    proximityScore * 0.35 +
    sizeScore * 0.25 +
    velocityScore * 0.15 +
    urgencyScore * 0.25

  // Hazardous flag bonus
  const hazardBonus = asteroid.hazardous ? 0.1 : 0

  return Math.round(Math.min((raw + hazardBonus) * 100, 100))
}

// Returns a color on the green → yellow → red spectrum for a 0–100 score
export function threatColor(score) {
  if (score >= 70) return '#ff3333'
  if (score >= 45) return '#ff9933'
  if (score >= 20) return '#ffcc33'
  return '#44cc66'
}

// Returns a human-readable threat level label
export function threatLabel(score) {
  if (score >= 70) return 'Critical'
  if (score >= 45) return 'High'
  if (score >= 20) return 'Moderate'
  return 'Low'
}
