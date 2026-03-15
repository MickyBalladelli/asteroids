import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
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
  onSearchSelect,
  hazardFilter,
  onHazardFilterChange,
  sizeFilter,
  onSizeFilterChange,
  searchOptions = [],
  inline = false,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: inline ? 'row' : 'column',
        flexWrap: inline ? 'wrap' : 'nowrap',
        alignItems: inline ? 'center' : 'stretch',
        gap: 1.5,
        width: inline ? '100%' : 220,
        p: inline ? 0 : 1.5,
        borderRadius: inline ? 0 : 3,
        border: inline ? 'none' : '1px solid rgba(255,255,255,0.12)',
        background: inline ? 'transparent' : 'rgba(7, 16, 35, 0.92)',
      }}
    >
      <Autocomplete
        freeSolo
        options={searchOptions}
        value={null}
        inputValue={searchText}
        onInputChange={(_, value, reason) => {
          // Ignore internal reset events so picking an option does not lock filtering to one name.
          if (reason === 'reset') return
          onSearchChange(value)
        }}
        onChange={(_, value) => {
          if (value && onSearchSelect) {
            onSearchSelect(value)
            onSearchChange('')
            return
          }

          onSearchChange(value || '')
        }}
        filterOptions={(options, state) => {
          const term = state.inputValue.trim().toLowerCase()
          if (!term) return options.slice(0, 12)
          return options
            .filter((name) => name.toLowerCase().includes(term))
            .slice(0, 12)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Search asteroids…"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{
          width: inline ? { xs: '100%', sm: 240 } : '100%',
          '& .MuiOutlinedInput-root, & .MuiAutocomplete-inputRoot': {
            color: '#e0e7ff',
            fontSize: '0.8rem',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused fieldset': { borderColor: '#65F9FF' },
          },
          '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
            color: 'rgba(255,255,255,0.5)',
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: inline ? 150 : 0 }}>
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

      <FormControl size="small" sx={{ minWidth: inline ? 130 : 0 }}>
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
