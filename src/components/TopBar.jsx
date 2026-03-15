import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TimeSlider from './TimeSlider';

function TopBar({
  timePreset,
  onTimePresetChange,
  hazardMode,
  onToggleHazard,
  asteroidCount,
  hazardousCount,
  loading
}) {
  return (
    <div className="pointer-events-auto overlay-blur absolute left-1/2 top-4 z-20 w-[min(98%,1100px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#071023aa] px-4 py-3 shadow-panel">
      <div className="flex flex-wrap items-center gap-4 text-slate-100">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-wide text-aqua">Asteroid Tracker</h1>
          <p className="m-0 text-xs uppercase tracking-[0.25em] text-slate-300/80">Near-Earth Object Visualization</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-4">
          <TimeSlider value={timePreset} onChange={onTimePresetChange} />

          <FormControlLabel
            control={<Switch checked={hazardMode} onChange={(event) => onToggleHazard(event.target.checked)} />}
            label="Hazard Radar"
          />

          <div className="rounded-lg bg-white/5 px-3 py-2 text-xs">
            <p className="m-0 text-slate-300">Asteroids: {asteroidCount}</p>
            <p className="m-0 text-[#ff9a9a]">Hazardous: {hazardousCount}</p>
          </div>

          {loading && <CircularProgress size={22} color="info" />}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
