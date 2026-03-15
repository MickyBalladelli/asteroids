import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Divider from '@mui/material/Divider';

function rowLabel(value, unit = '') {
  if (Number.isNaN(value) || value === undefined || value === null) {
    return 'N/A';
  }

  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`;
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
          background: 'linear-gradient(145deg, rgba(19,31,57,0.92), rgba(9,16,30,0.92))',
          border: '1px solid rgba(138, 171, 255, 0.35)',
          color: '#e9f0ff'
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold tracking-wide">{asteroid?.name || 'Select asteroid'}</h2>
          <Chip
            size="small"
            label={asteroid?.hazardous ? 'Hazardous' : 'Safe'}
            color={asteroid?.hazardous ? 'error' : 'success'}
          />
        </div>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(144, 166, 214, 0.35)' }} />

        <div className="space-y-1 text-sm text-slate-100/90">
          <p className="m-0">Diameter: {rowLabel(asteroid?.diameterKm, ' km')}</p>
          <p className="m-0">Velocity: {rowLabel(asteroid?.velocityKph, ' km/h')}</p>
          <p className="m-0">Miss Distance: {rowLabel(asteroid?.missDistanceKm, ' km')}</p>
          <p className="m-0">Close Approach: {asteroid?.closeApproachDate || 'N/A'}</p>
        </div>
      </Paper>
    </Fade>
  );
}

export default InfoPanel;
