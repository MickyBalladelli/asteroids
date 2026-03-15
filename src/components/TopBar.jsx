import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TimeSlider from './TimeSlider'

function TopBar({
  timePreset,
  onTimePresetChange,
  hazardMode,
  onToggleHazard,
  asteroidCount,
  hazardousCount,
  loading,
}) {
  return (
    <Box
      sx={{
        pointerEvents: 'auto',
        position: 'absolute',
        left: '50%',
        top: 16,
        zIndex: 20,
        width: 'min(98%, 1100px)',
        transform: 'translateX(-50%)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(7, 16, 35, 0.92)',
        px: 2,
        py: 1.5,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        color: '#f1f5f9',
      }}
    >
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
      >
        <Box>
          <Typography
            sx={{
              m: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: 0.4,
              color: '#65F9FF',
            }}
          >
            Asteroid Tracker
          </Typography>
          <Typography
            sx={{
              m: 0,
              fontSize: '0.72rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(203, 213, 225, 0.8)',
            }}
          >
            Near-Earth Object Visualization
          </Typography>
        </Box>

        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TimeSlider value={timePreset} onChange={onTimePresetChange} />

          <FormControlLabel
            control={
              <Switch
                checked={hazardMode}
                onChange={(event) => onToggleHazard(event.target.checked)}
              />
            }
            label="Hazard Radar"
            sx={{ m: 0 }}
          />

          <Box
            sx={{
              borderRadius: 1.5,
              background: 'rgba(255,255,255,0.05)',
              px: 1.5,
              py: 1,
              fontSize: '0.75rem',
            }}
          >
            <Typography sx={{ m: 0, color: 'rgb(203, 213, 225)' }}>
              Asteroids: {asteroidCount}
            </Typography>
            <Typography sx={{ m: 0, color: '#ff9a9a' }}>
              Hazardous: {hazardousCount}
            </Typography>
          </Box>

          {loading && <CircularProgress size={22} color="info" />}
        </Box>
      </Box>
    </Box>
  )
}

export default TopBar
