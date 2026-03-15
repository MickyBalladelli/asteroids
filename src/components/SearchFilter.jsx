import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

const selectSx = {
  color: '#e0e7ff',
  fontSize: '0.8rem',
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.18)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.35)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#65F9FF',
  },
  '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
}

const labelSx = {
  color: 'rgba(203, 213, 225, 0.7)',
  fontSize: '0.8rem',
  '&.Mui-focused': { color: '#65F9FF' },
}

function SearchFilter({
  searchText,
  onSearchChange,
  hazardFilter,
  onHazardFilterChange,
  sizeFilter,
  onSizeFilterChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: 220,
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(7, 16, 35, 0.92)',
      }}
    >
      <TextField
        size="small"
        placeholder="Search asteroids…"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: '#e0e7ff',
            fontSize: '0.8rem',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused fieldset': { borderColor: '#65F9FF' },
          },
        }}
      />

      <FormControl size="small">
        <InputLabel sx={labelSx}>Hazard Level</InputLabel>
        <Select
          value={hazardFilter}
          label="Hazard Level"
          onChange={(e) => onHazardFilterChange(e.target.value)}
          sx={selectSx}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="hazardous">Hazardous</MenuItem>
          <MenuItem value="safe">Safe</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small">
        <InputLabel sx={labelSx}>Size</InputLabel>
        <Select
          value={sizeFilter}
          label="Size"
          onChange={(e) => onSizeFilterChange(e.target.value)}
          sx={selectSx}
        >
          <MenuItem value="all">All Sizes</MenuItem>
          <MenuItem value="small">&lt; 0.1 km</MenuItem>
          <MenuItem value="medium">0.1 – 0.5 km</MenuItem>
          <MenuItem value="large">&gt; 0.5 km</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default SearchFilter
