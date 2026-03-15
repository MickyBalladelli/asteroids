import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TimeSlider from './TimeSlider'
import SearchFilter from './SearchFilter'
import ThreatPanel from './ThreatPanel'

function TopBar({
  timePreset,
  onTimePresetChange,
  atScale,
  onToggleAtScale,
  hazardMode,
  onToggleHazard,
  radarMode,
  onRadarModeChange,
  asteroidCount,
  hazardousCount,
  loading,
  searchText,
  onSearchChange,
  onSearchSelect,
  searchOptions,
  hazardFilter,
  onHazardFilterChange,
  sizeFilter,
  onSizeFilterChange,
  asteroids,
  onSelectAsteroid,
}) {
  return (
    <Box
      sx={{
        pointerEvents: 'auto',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 20,
        width: '100%',
        transform: 'none',
        borderRadius: 0,
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(7, 16, 35, 0.92)',
        px: { xs: 1.5, md: 2.5 },
        py: 1.5,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
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
            sx={{ m: 0, marginLeft: 10 }}
          />

          {hazardMode && (
            <Select
              size="small"
              value={radarMode}
              onChange={(e) => onRadarModeChange(e.target.value)}
              sx={{
                color: '#e0e8f5',
                fontSize: '0.75rem',
                height: 32,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.4)',
                },
                '.MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' },
              }}
              aria-label="Radar mode"
            >
              <MenuItem value="visual">Visual</MenuItem>
              <MenuItem value="risk">Risk Weighted</MenuItem>
              <MenuItem value="imminent">Imminent Only</MenuItem>
            </Select>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={atScale}
                onChange={(event) => onToggleAtScale(event.target.checked)}
              />
            }
            label="At Scale"
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

      <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <SearchFilter
          inline
          searchText={searchText}
          onSearchChange={onSearchChange}
          onSearchSelect={onSearchSelect}
          searchOptions={searchOptions}
          hazardFilter={hazardFilter}
          onHazardFilterChange={onHazardFilterChange}
          sizeFilter={sizeFilter}
          onSizeFilterChange={onSizeFilterChange}
        />
        {hazardMode && asteroids && asteroids.length > 0 && (
          <ThreatPanel asteroids={asteroids} onSelect={onSelectAsteroid} />
        )}
      </Box>
    </Box>
  )
}

export default TopBar
