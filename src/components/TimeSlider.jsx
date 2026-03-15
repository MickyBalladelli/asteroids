import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'

const marks = [
  { value: 0, label: 'Today' },
  { value: 1, label: 'Next 7 Days' },
  { value: 2, label: 'Next 30 Days' },
]

function TimeSlider({ value, onChange }) {
  return (
    <Box sx={{ width: 288 }}>
      <Slider
        value={value}
        min={0}
        max={2}
        step={1}
        marks={marks}
        onChange={(_, nextValue) => onChange(nextValue)}
        sx={{
          color: '#7bdff2',
          '& .MuiSlider-markLabel': {
            color: 'rgba(220, 230, 255, 0.85)',
            fontSize: '0.72rem',
          },
        }}
      />
    </Box>
  )
}

export default TimeSlider
