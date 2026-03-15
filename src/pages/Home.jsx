import { useCallback, useMemo, useRef, useState } from 'react'
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
import useAsteroids from '../hooks/useAsteroids'

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

  const positionsRef = useRef({})
  const daysAhead = PRESET_TO_DAYS[timePreset]
  const { asteroids, loading, stats } = useAsteroids(daysAhead, atScale)

  const filteredAsteroids = useMemo(() => {
    let result = asteroids

    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter((a) => a.name.toLowerCase().includes(lower))
    }

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
  }, [asteroids, searchText, hazardFilter, sizeFilter])

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
    () => [...new Set(asteroids.map((a) => a.name))].sort((a, b) => a.localeCompare(b)),
    [asteroids],
  )

  const handleSearchSelect = useCallback(
    (name) => {
      const match = asteroids.find((asteroid) => asteroid.name === name)
      if (match) {
        setSelectedAsteroid(match)
      }
    },
    [asteroids],
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
        {selectedAsteroid && (
          <InfoPanel
            asteroid={selectedAsteroid}
            currentIndex={selectedIndex}
            totalCount={filteredAsteroids.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </Box>

      <Canvas
        camera={{ position: [0, 36, 110], fov: 48, near: 0.1, far: 20000 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
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

        <Earth />
        <Radar enabled={hazardMode} maxThreatScore={maxThreatScore} />
        <AsteroidField
          asteroids={displayedAsteroids}
          hazardMode={hazardMode}
          onSelect={setSelectedAsteroid}
          selectedId={selectedAsteroid?.id || null}
          positionsRef={positionsRef}
        />
        <DistanceLine
          positionsRef={positionsRef}
          selectedId={selectedAsteroid?.id || null}
          selectedName={selectedAsteroid?.name || ''}
        />

        <CameraController
          selectedAsteroid={selectedAsteroid}
          positionsRef={positionsRef}
          enablePan
          enableZoom
          minDistance={4}
          maxDistance={1400}
          maxPolarAngle={Math.PI - 0.12}
          minPolarAngle={0.2}
        />
      </Canvas>
    </Box>
  )
}

export default Home
