import { memo, useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import * as satellite from 'satellite.js'

const KM_TO_UNITS = 1.5 / 6371

function Row({ label, value }) {
  return (
    <Typography sx={{ m: 0, fontSize: '0.875rem', color: 'rgba(241,245,249,0.9)' }}>
      {label}:{' '}
      <Box component="span" sx={{ color: '#b8d4ff' }}>
        {value}
      </Box>
    </Typography>
  )
}

function SatelliteInfoPanel({ sat, currentIndex, totalCount, onPrev, onNext }) {
  const [altKm, setAltKm] = useState(null)

  // Recompute live altitude every second
  useEffect(() => {
    if (!sat) return
    const update = () => {
      const pv = satellite.propagate(sat.satrec, new Date())
      if (pv?.position) {
        const { x, y, z } = pv.position
        const rKm = Math.sqrt(x * x + y * y + z * z)
        setAltKm(Math.round(rKm - 6371))
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [sat])

  return (
    <Fade in={Boolean(sat)} timeout={300}>
      <Paper
        elevation={6}
        sx={{
          width: 380,
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(145deg, rgba(10,28,50,0.94), rgba(6,18,34,0.94))',
          border: '1px solid rgba(0,230,176,0.35)',
          color: '#e9f0ff',
        }}
      >
        {sat && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  m: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#65f9ff',
                }}
              >
                {sat.name}
              </Typography>
              <Chip
                size="small"
                label={`NORAD ${sat.id}`}
                sx={{
                  bgcolor: 'rgba(0,230,176,0.12)',
                  color: '#00e5b0',
                  border: '1px solid rgba(0,230,176,0.4)',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
            </Box>

            {totalCount > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75, pointerEvents: 'all' }}>
                <IconButton size="small" onClick={onPrev} sx={{ color: '#00e5b0', p: 0.5 }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(180,220,255,0.7)' }}>
                  {currentIndex + 1} / {totalCount}
                </Typography>
                <IconButton size="small" onClick={onNext} sx={{ color: '#00e5b0', p: 0.5 }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Divider sx={{ my: 1.25, borderColor: 'rgba(0,230,176,0.2)' }} />

            <Box sx={{ display: 'grid', rowGap: 0.4 }}>
              <Row label="Current Altitude" value={altKm != null ? `${altKm.toLocaleString()} km` : '…'} />
              <Row label="Mean Altitude" value={`${sat.altitudeKm.toLocaleString()} km`} />
              <Row label="Orbital Period" value={`${sat.periodMin} min`} />
              <Row label="Inclination" value={`${sat.inclinationDeg}°`} />
              <Row label="Eccentricity" value={sat.eccentricity} />
              <Row label="RAAN" value={`${sat.raanDeg}°`} />
              <Row label="Arg. of Perigee" value={`${sat.argPerigeeDeg}°`} />
              <Row label="Mean Anomaly" value={`${sat.meanAnomalyDeg}°`} />
            </Box>

            <Divider sx={{ my: 1.25, borderColor: 'rgba(0,230,176,0.2)' }} />

            <Box sx={{ display: 'grid', rowGap: 0.4 }}>
              <Row label="TLE Epoch" value={sat.epoch} />
              <Row label="Revolutions at Epoch" value={sat.revNumber?.toLocaleString()} />
              <Row label="B* Drag Term" value={sat.bstar} />
              <Row label="Int'l Designator" value={sat.intlDesignator || '—'} />
              <Row label="Classification" value={sat.classification} />
            </Box>
          </>
        )}
      </Paper>
    </Fade>
  )
}

export default memo(SatelliteInfoPanel)
