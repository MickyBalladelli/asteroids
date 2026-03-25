import { useState } from 'react'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Link from '@mui/material/Link'
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
  showSatellites,
  onToggleSatellites,
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
}) {
  const [aboutOpen, setAboutOpen] = useState(false)

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
              color: showSatellites ? '#00e5b0' : '#65F9FF',
              transition: 'color 0.3s',
            }}
          >
            {showSatellites ? 'Satellite Tracker' : 'Asteroid Tracker'}
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
            {showSatellites ? 'Earth-Orbiting Stations' : 'Near-Earth Object Visualization'}
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
          {!showSatellites && (
            <>
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
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={showSatellites}
                onChange={(event) => onToggleSatellites(event.target.checked)}
              />
            }
            label="Satellites"
            sx={{ m: 0 }}
          />

          {showSatellites && satellites && satellites.length > 0 && (
            <Select
              size="small"
              value={selectedSatelliteId || ''}
              onChange={(e) => {
                const sat = satellites.find((s) => s.id === e.target.value)
                if (sat) onSelectSatellite(sat)
              }}
              displayEmpty
              sx={{
                color: '#e0e8f5',
                fontSize: '0.75rem',
                height: 32,
                minWidth: 160,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,230,176,0.35)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,230,176,0.65)',
                },
                '.MuiSelect-icon': { color: 'rgba(0,230,176,0.6)' },
              }}
              aria-label="Select satellite"
            >
              {satellites.map((sat) => (
                <MenuItem key={sat.id} value={sat.id} sx={{ fontSize: '0.78rem' }}>
                  {sat.name}
                </MenuItem>
              ))}
            </Select>
          )}

          {!showSatellites && (
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
          )}

          {loading && <CircularProgress size={22} color="info" />}

          <Button
            variant="outlined"
            size="small"
            onClick={() => setAboutOpen(true)}
            sx={{
              color: '#d8e8ff',
              borderColor: 'rgba(140, 180, 255, 0.45)',
              textTransform: 'none',
              fontSize: '0.78rem',
              '&:hover': {
                borderColor: 'rgba(140, 180, 255, 0.8)',
                bgcolor: 'rgba(140, 180, 255, 0.08)',
              },
            }}
          >
            About
          </Button>
        </Box>
      </Box>

      {!showSatellites && (
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
      )}

      <Dialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(160deg, rgba(12,20,40,0.96), rgba(8,14,28,0.97))',
            border: '1px solid rgba(101,249,255,0.28)',
            color: '#eaf2ff',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: showSatellites ? '#00e5b0' : '#65F9FF', fontWeight: 700 }}>
          About {showSatellites ? 'Satellite Tracker' : 'Asteroid Tracker'}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(140,170,220,0.22)' }}>
          <Typography sx={{ m: 0, mb: 1.1, fontSize: '0.95rem' }}>
            Author: <strong>Micky Balladelli</strong>
          </Typography>

          <Typography sx={{ m: 0, mb: 1.1, fontSize: '0.9rem', lineHeight: 1.55 }}>
            Source code:{' '}
            <Link
              href="https://github.com/MickyBalladelli/asteroids"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: '#9cd6ff' }}
            >
              github.com/MickyBalladelli/asteroids
            </Link>
          </Typography>

          <Typography sx={{ m: 0, mb: 1.1, fontSize: '0.9rem', lineHeight: 1.55 }}>
            Data source: NASA Open APIs (Near Earth Object feed).{' '}
            <Link
              href="https://api.nasa.gov/neo/rest/v1/feed?start_date=2026-03-15&end_date=2026-03-16&api_key=DEMO_KEY"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: '#9cd6ff' }}
            >
              api.nasa.gov
            </Link>{' '}
            |{' '}
            <Link
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: '#9cd6ff' }}
            >
              NEO Feed endpoint (/neo/rest/v1/feed)
            </Link>
          </Typography>

          <Typography sx={{ m: 0, fontSize: '0.84rem', color: 'rgba(208,223,245,0.86)', lineHeight: 1.7 }}>
            This app visualizes near-earth asteroid trajectories with interactive filtering,
            threat scoring, radar modes, and focused camera tracking. Threat labels are a
            local model-based ranking and should not be interpreted as official impact
            predictions.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.1 }}>
          <Button
            onClick={() => setAboutOpen(false)}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TopBar
