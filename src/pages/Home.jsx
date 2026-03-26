import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import Box from '@mui/material/Box'
import * as THREE from 'three'
import Earth from '../components/Earth'
import AsteroidField from '../components/AsteroidField'
import Radar from '../components/Radar'
import TopBar from '../components/TopBar'
import InfoPanel from '../components/InfoPanel'
import CameraController from '../components/CameraController'
import DistanceLine from '../components/DistanceLine'
import SatelliteLayer from '../components/SatelliteLayer'
import SatelliteInfoPanel from '../components/SatelliteInfoPanel'
import useAsteroids from '../hooks/useAsteroids'
import useSatellites from '../hooks/useSatellites'

const PRESET_TO_DAYS = [0, 7, 30]

function SpaceBackdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color('#17264d') },
          bottomColor: { value: new THREE.Color('#02030a') },
          accentColor: { value: new THREE.Color('#3e1f4d') },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform vec3 accentColor;
          void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            float n = sin(vPos.x * 0.07) * cos(vPos.z * 0.05);
            vec3 color = mix(bottomColor, topColor, smoothstep(0.1, 0.95, h));
            color = mix(color, accentColor, n * 0.08 + 0.06);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [],
  )

  return (
    <mesh material={material} raycast={() => null}>
      <sphereGeometry args={[12000, 32, 32]} />
    </mesh>
  )
}

function Home() {
  const [timePreset, setTimePreset] = useState(1)
  const [atScale, setAtScale] = useState(true)
  const [hazardMode, setHazardMode] = useState(false)
  const [radarMode, setRadarMode] = useState('visual')
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [hazardFilter, setHazardFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [hoverInfo, setHoverInfo] = useState(null)

  const [showSatellites, setShowSatellites] = useState(false)
  const [selectedSatellite, setSelectedSatellite] = useState(null)

  const positionsRef = useRef({})
  const satellitePositionsRef = useRef({})
  const simTimeRef = useRef(Date.now())
  const daysAhead = PRESET_TO_DAYS[timePreset]
  const { asteroids, loading, stats } = useAsteroids(daysAhead, atScale)
  const { satellites: satelliteData } = useSatellites(showSatellites)

  // Auto-select ISS when satellite data first loads; clear selection when hidden
  const autoSelectedRef = useRef(false)
  useEffect(() => {
    if (!showSatellites) {
      setSelectedSatellite(null)
      autoSelectedRef.current = false
      return
    }
    if (satelliteData.length > 0 && !autoSelectedRef.current) {
      autoSelectedRef.current = true
      const iss = satelliteData.find((s) => s.name.includes('ISS'))
      setSelectedSatellite(iss || satelliteData[0])
    }
  }, [showSatellites, satelliteData])

  useEffect(() => {
    if (showSatellites) return

    if (asteroids.length === 0) {
      setSelectedAsteroid(null)
      return
    }

    if (!selectedAsteroid) {
      setSelectedAsteroid(asteroids[0])
      return
    }

    const stillExists = asteroids.some((a) => a.id === selectedAsteroid.id)
    if (!stillExists) {
      setSelectedAsteroid(asteroids[0])
    }
  }, [asteroids, selectedAsteroid, showSatellites])

  const filterScopedAsteroids = useMemo(() => {
    let result = asteroids

    if (hazardFilter === 'hazardous') {
      result = result.filter((a) => a.hazardous)
    } else if (hazardFilter === 'safe') {
      result = result.filter((a) => !a.hazardous)
    }

    if (sizeFilter === 'small') {
      result = result.filter((a) => a.diameterKm < 0.1)
    } else if (sizeFilter === 'medium') {
      result = result.filter((a) => a.diameterKm >= 0.1 && a.diameterKm < 0.5)
    } else if (sizeFilter === 'large') {
      result = result.filter((a) => a.diameterKm >= 0.5)
    }

    return result
  }, [asteroids, hazardFilter, sizeFilter])

  const filteredAsteroids = useMemo(() => {
    if (!searchText) return filterScopedAsteroids
    const lower = searchText.toLowerCase()
    return filterScopedAsteroids.filter((a) => a.name.toLowerCase().includes(lower))
  }, [filterScopedAsteroids, searchText])

  const maxThreatScore = useMemo(() => {
    if (filteredAsteroids.length === 0) return 0
    return Math.max(...filteredAsteroids.map((a) => a.threatScore || 0))
  }, [filteredAsteroids])

  // In 'imminent' radar mode, only show asteroids approaching within 7 days
  const displayedAsteroids = useMemo(() => {
    if (!hazardMode || radarMode !== 'imminent') return filteredAsteroids
    const now = new Date()
    const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return filteredAsteroids.filter((a) => {
      if (!a.closeApproachDate || a.closeApproachDate === 'Unknown') return false
      const d = new Date(a.closeApproachDate)
      return d <= cutoff
    })
  }, [filteredAsteroids, hazardMode, radarMode])

  const searchOptions = useMemo(
    () =>
      [...new Set(filterScopedAsteroids.map((a) => a.name))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [filterScopedAsteroids],
  )

  const handleSearchSelect = useCallback(
    (name) => {
      const match = filterScopedAsteroids.find((asteroid) => asteroid.name === name)
      if (match) {
        setSelectedAsteroid(match)
      }
    },
    [filterScopedAsteroids],
  )

  const selectedIndex = useMemo(() => {
    if (!selectedAsteroid) return -1
    return filteredAsteroids.findIndex((a) => a.id === selectedAsteroid.id)
  }, [filteredAsteroids, selectedAsteroid])

  const handlePrev = useCallback(() => {
    if (filteredAsteroids.length === 0) return
    const idx = selectedIndex <= 0 ? filteredAsteroids.length - 1 : selectedIndex - 1
    setSelectedAsteroid(filteredAsteroids[idx])
  }, [filteredAsteroids, selectedIndex])

  const handleNext = useCallback(() => {
    if (filteredAsteroids.length === 0) return
    const idx = selectedIndex >= filteredAsteroids.length - 1 ? 0 : selectedIndex + 1
    setSelectedAsteroid(filteredAsteroids[idx])
  }, [filteredAsteroids, selectedIndex])

  const handleAsteroidHover = useCallback((event, asteroid) => {
    const sourceEvent = event?.nativeEvent || event
    if (!sourceEvent) return

    setHoverInfo({
      id: asteroid.id,
      name: asteroid.name,
      distanceKm: asteroid.missDistanceKm,
      x: sourceEvent.clientX,
      y: sourceEvent.clientY,
    })
  }, [])

  const handleAsteroidHoverEnd = useCallback(() => {
    setHoverInfo(null)
  }, [])

  const [satHoverInfo, setSatHoverInfo] = useState(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const satHoverClearRef = useRef(null)

  // Track real mouse coords independently from R3F events
  useEffect(() => {
    const track = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      setSatHoverInfo((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)
    }
    window.addEventListener('mousemove', track)
    return () => window.removeEventListener('mousemove', track)
  }, [])

  const handleSatHover = useCallback((sat) => {
    if (satHoverClearRef.current) { clearTimeout(satHoverClearRef.current); satHoverClearRef.current = null }
    setSatHoverInfo({ name: sat.name, x: mousePos.current.x, y: mousePos.current.y })
  }, [])

  const handleSatHoverEnd = useCallback(() => {
    satHoverClearRef.current = setTimeout(() => setSatHoverInfo(null), 120)
  }, [])

  const selectedSatIndex = useMemo(() => {
    if (!selectedSatellite) return -1
    return satelliteData.findIndex((s) => s.id === selectedSatellite.id)
  }, [satelliteData, selectedSatellite])

  const handleSatPrev = useCallback(() => {
    if (!satelliteData.length) return
    const idx = selectedSatIndex <= 0 ? satelliteData.length - 1 : selectedSatIndex - 1
    setSelectedSatellite(satelliteData[idx])
  }, [satelliteData, selectedSatIndex])

  const handleSatNext = useCallback(() => {
    if (!satelliteData.length) return
    const idx = selectedSatIndex >= satelliteData.length - 1 ? 0 : selectedSatIndex + 1
    setSelectedSatellite(satelliteData[idx])
  }, [satelliteData, selectedSatIndex])

  const hoverDistanceLabel = useMemo(() => {
    if (!hoverInfo) return ''
    return Number(hoverInfo.distanceKm || 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  }, [hoverInfo])

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#060B18',
      }}
    >
      <TopBar
        timePreset={timePreset}
        onTimePresetChange={setTimePreset}
        atScale={atScale}
        onToggleAtScale={setAtScale}
        hazardMode={hazardMode}
        onToggleHazard={setHazardMode}
        radarMode={radarMode}
        onRadarModeChange={setRadarMode}
        asteroidCount={displayedAsteroids.length}
        hazardousCount={stats.hazardous}
        loading={loading}
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchSelect={handleSearchSelect}
        searchOptions={searchOptions}
        hazardFilter={hazardFilter}
        onHazardFilterChange={setHazardFilter}
        sizeFilter={sizeFilter}
        onSizeFilterChange={setSizeFilter}
        asteroids={displayedAsteroids}
        onSelectAsteroid={setSelectedAsteroid}
        showSatellites={showSatellites}
        onToggleSatellites={(val) => {
          setShowSatellites(val)
          if (val) setSelectedAsteroid(null)
        }}
        satellites={satelliteData}
        selectedSatelliteId={selectedSatellite?.id || null}
        onSelectSatellite={setSelectedSatellite}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {!showSatellites && selectedAsteroid && (
          <InfoPanel
            asteroid={selectedAsteroid}
            currentIndex={selectedIndex}
            totalCount={filteredAsteroids.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </Box>

      {showSatellites && selectedSatellite && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <SatelliteInfoPanel
              sat={selectedSatellite}
              currentIndex={selectedSatIndex}
              totalCount={satelliteData.length}
              onPrev={handleSatPrev}
              onNext={handleSatNext}
            />
        </Box>
      )}

      <Canvas
        camera={{ position: [0, 36, 110], fov: 48, near: 0.1, far: 20000 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        raycaster={{ params: { Line: { threshold: 0.85 } } }}
      >
        <color attach="background" args={['#02040b']} />

        <SpaceBackdrop />
        <Stars
          radius={5000}
          depth={4000}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0}
        />

        <ambientLight intensity={0.2} color="#5674aa" />
        <directionalLight
          position={[6, 4, 5]}
          intensity={1.4}
          color="#fff0dc"
        />
        <pointLight position={[-12, -4, -9]} intensity={0.22} color="#4e6cff" />

        <Earth simTimeRef={simTimeRef} />
        <Radar enabled={hazardMode} maxThreatScore={maxThreatScore} />
        <AsteroidField
          asteroids={displayedAsteroids}
          hazardMode={hazardMode}
          onSelect={setSelectedAsteroid}
          selectedId={showSatellites ? null : (selectedAsteroid?.id || null)}
          positionsRef={positionsRef}
          onHover={handleAsteroidHover}
          onHoverEnd={handleAsteroidHoverEnd}
        />
        {showSatellites && (
          <SatelliteLayer
            satellites={satelliteData}
            selectedId={selectedSatellite?.id || null}
            onSelect={setSelectedSatellite}
            satellitePositionsRef={satellitePositionsRef}
            simTimeRef={simTimeRef}
          />
        )}
        <DistanceLine
          positionsRef={positionsRef}
          selectedId={showSatellites ? null : (selectedAsteroid?.id || null)}
          selectedName={showSatellites ? '' : (selectedAsteroid?.name || '')}
        />

        <CameraController
          selectedAsteroid={selectedAsteroid}
          positionsRef={positionsRef}
          selectedSatellite={showSatellites ? selectedSatellite : null}
          satellitePositionsRef={satellitePositionsRef}
          enablePan
          enableZoom
          minDistance={showSatellites && selectedSatellite ? 1.8 : 4}
          maxDistance={1400}
          maxPolarAngle={Math.PI - 0.12}
          minPolarAngle={0.2}
        />
      </Canvas>

      {satHoverInfo && (
        <Box
          sx={{
            position: 'fixed',
            left: satHoverInfo.x + 14,
            top: satHoverInfo.y + 14,
            zIndex: 40,
            pointerEvents: 'none',
            px: 1.2,
            py: 0.7,
            borderRadius: 1.5,
            background: 'rgba(4, 20, 30, 0.92)',
            border: '1px solid rgba(0, 230, 176, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            minWidth: 120,
          }}
        >
          <Box
            component="p"
            sx={{ m: 0, fontSize: '0.76rem', fontWeight: 600, color: '#65f9ff', lineHeight: 1.35 }}
          >
            {satHoverInfo.name}
          </Box>
        </Box>
      )}

      {hoverInfo && (
        <Box
          sx={{
            position: 'fixed',
            left: hoverInfo.x + 14,
            top: hoverInfo.y + 14,
            zIndex: 40,
            pointerEvents: 'none',
            px: 1.2,
            py: 0.7,
            borderRadius: 1.5,
            background: 'rgba(8, 16, 34, 0.9)',
            border: '1px solid rgba(130, 178, 255, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            minWidth: 130,
          }}
        >
          <Box
            component="p"
            sx={{
              m: 0,
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#e8f1ff',
              lineHeight: 1.35,
            }}
          >
            {hoverInfo.name}
          </Box>
          <Box
            component="p"
            sx={{
              m: 0,
              fontSize: '0.7rem',
              color: 'rgba(204, 224, 255, 0.9)',
            }}
          >
            {`Distance: ${hoverDistanceLabel} km`}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default Home
