import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { threatColor, threatLabel } from '../utils/threatScore'

function rowLabel(value, unit = '') {
  if (Number.isNaN(value) || value === undefined || value === null) {
    return 'N/A'
  }

  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`
}

function InfoPanel({ asteroid, currentIndex, totalCount, onPrev, onNext }) {
  return (
    <Fade in={Boolean(asteroid)} timeout={300}>
      <Paper
        elevation={6}
        sx={{
          width: 320,
          p: 2,
          borderRadius: 3,
          background:
            'linear-gradient(145deg, rgba(19,31,57,0.92), rgba(9,16,30,0.92))',
          border: '1px solid rgba(138, 171, 255, 0.35)',
          color: '#e9f0ff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              m: 0,
              fontSize: '1.125rem',
              fontWeight: 600,
              letterSpacing: 0.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {asteroid?.name || 'Select asteroid'}
          </Typography>
          <Chip
            size="small"
            label={asteroid?.hazardous ? 'Hazardous' : 'Safe'}
            color={asteroid?.hazardous ? 'error' : 'success'}
          />
          {asteroid?.threatScore != null && (
            <Chip
              size="small"
              label={`${threatLabel(asteroid.threatScore)} (${asteroid.threatScore})`}
              sx={{
                bgcolor: `${threatColor(asteroid.threatScore)}22`,
                color: threatColor(asteroid.threatScore),
                border: `1px solid ${threatColor(asteroid.threatScore)}55`,
                fontWeight: 600,
                fontSize: '0.68rem',
              }}
            />
          )}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(144, 166, 214, 0.35)' }} />

        <Box sx={{ display: 'grid', rowGap: 0.5 }}>
          <Typography
            sx={{ m: 0, fontSize: '0.875rem', color: 'rgba(241,245,249,0.9)' }}
          >
            Diameter: {rowLabel(asteroid?.diameterKm, ' km')}
          </Typography>
          <Typography
            sx={{ m: 0, fontSize: '0.875rem', color: 'rgba(241,245,249,0.9)' }}
          >
            Velocity: {rowLabel(asteroid?.velocityKph, ' km/h')}
          </Typography>
          <Typography
            sx={{ m: 0, fontSize: '0.875rem', color: 'rgba(241,245,249,0.9)' }}
          >
            Miss Distance: {rowLabel(asteroid?.missDistanceKm, ' km')}
          </Typography>
          <Typography
            sx={{ m: 0, fontSize: '0.875rem', color: 'rgba(241,245,249,0.9)' }}
          >
            Close Approach: {asteroid?.closeApproachDate || 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(144, 166, 214, 0.35)' }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto',
          }}
        >
          <IconButton
            size="small"
            onClick={onPrev}
            disabled={totalCount === 0}
            sx={{ color: '#8bb8ff' }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ m: 0, fontSize: '0.75rem', color: 'rgba(203,213,225,0.8)' }}>
            {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : '—'}
          </Typography>
          <IconButton
            size="small"
            onClick={onNext}
            disabled={totalCount === 0}
            sx={{ color: '#8bb8ff' }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Paper>
    </Fade>
  )
}

export default InfoPanel
