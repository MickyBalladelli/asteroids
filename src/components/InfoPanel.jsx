import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function rowLabel(value, unit = '') {
  if (Number.isNaN(value) || value === undefined || value === null) {
    return 'N/A'
  }

  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`
}

function InfoPanel({ asteroid }) {
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
            }}
          >
            {asteroid?.name || 'Select asteroid'}
          </Typography>
          <Chip
            size="small"
            label={asteroid?.hazardous ? 'Hazardous' : 'Safe'}
            color={asteroid?.hazardous ? 'error' : 'success'}
          />
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
      </Paper>
    </Fade>
  )
}

export default InfoPanel
