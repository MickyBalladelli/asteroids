import { memo, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { threatColor, threatLabel } from '../utils/threatScore'

function ThreatPanel({ asteroids, onSelect }) {
  const topThreats = useMemo(() => {
    return [...asteroids]
      .sort((a, b) => b.threatScore - a.threatScore)
      .slice(0, 3)
  }, [asteroids])

  if (topThreats.length === 0) return null

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'stretch',
      }}
    >
      {topThreats.map((ast, idx) => {
        const color = threatColor(ast.threatScore)
        return (
          <Box
            key={ast.id}
            onClick={() => onSelect(ast)}
            sx={{
              cursor: 'pointer',
              borderRadius: 1.5,
              border: `1px solid ${color}44`,
              background: `${color}11`,
              px: 1.2,
              py: 0.6,
              minWidth: 120,
              transition: 'background 0.2s, border-color 0.2s',
              '&:hover': {
                background: `${color}22`,
                borderColor: `${color}88`,
              },
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select threat ${idx + 1}: ${ast.name}, score ${ast.threatScore}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(ast)
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.2 }}>
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <Typography
                sx={{
                  m: 0,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {threatLabel(ast.threatScore)} ({ast.threatScore})
              </Typography>
            </Box>
            <Typography
              sx={{
                m: 0,
                fontSize: '0.72rem',
                color: '#e0e8f5',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ast.name}
            </Typography>
            <Typography
              sx={{
                m: 0,
                fontSize: '0.62rem',
                color: 'rgba(203,213,225,0.7)',
              }}
            >
              {ast.missDistanceKm < 1e6
                ? `${Math.round(ast.missDistanceKm).toLocaleString()} km`
                : `${(ast.missDistanceKm / 1e6).toFixed(2)} M km`}
              {' · '}
              {ast.closeApproachDate}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export default memo(ThreatPanel)
