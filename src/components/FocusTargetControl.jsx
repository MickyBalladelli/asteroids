import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import PublicIcon from '@mui/icons-material/Public'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'

function FocusTargetControl({ value, onChange, objectLabel = 'Object', disabled = false }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, nextValue) => {
        if (nextValue) onChange(nextValue)
      }}
      aria-label="Camera focus"
      sx={{
        height: 32,
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 1.5,
        overflow: 'hidden',
        '.MuiToggleButton-root': {
          color: 'rgba(226, 236, 255, 0.78)',
          border: 0,
          borderRadius: 0,
          px: 1,
          gap: 0.6,
          fontSize: '0.72rem',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&.Mui-selected': {
            bgcolor: 'rgba(101, 249, 255, 0.18)',
            color: '#65F9FF',
          },
          '&.Mui-selected:hover': {
            bgcolor: 'rgba(101, 249, 255, 0.24)',
          },
        },
      }}
    >
      <ToggleButton value="earth" aria-label="Focus Earth">
        <PublicIcon sx={{ fontSize: 15 }} />
        Earth
      </ToggleButton>
      <ToggleButton value="object" aria-label={`Focus ${objectLabel}`} disabled={disabled}>
        <TrackChangesIcon sx={{ fontSize: 15 }} />
        {objectLabel}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default FocusTargetControl
