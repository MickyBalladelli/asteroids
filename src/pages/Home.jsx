import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Earth from '../components/Earth';
import AsteroidField from '../components/AsteroidField';
import Radar from '../components/Radar';
import TopBar from '../components/TopBar';
import InfoPanel from '../components/InfoPanel';
import useAsteroids from '../hooks/useAsteroids';

const PRESET_TO_DAYS = [0, 7, 30];

function SpaceBackdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color('#17264d') },
          bottomColor: { value: new THREE.Color('#02030a') },
          accentColor: { value: new THREE.Color('#3e1f4d') }
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
        `
      }),
    []
  );

  return (
    <mesh material={material}>
      <sphereGeometry args={[90, 32, 32]} />
    </mesh>
  );
}

function Home() {
  const [timePreset, setTimePreset] = useState(1);
  const [hazardMode, setHazardMode] = useState(false);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);

  const daysAhead = PRESET_TO_DAYS[timePreset];
  const { asteroids, loading, stats } = useAsteroids(daysAhead);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-void">
      <TopBar
        timePreset={timePreset}
        onTimePresetChange={setTimePreset}
        hazardMode={hazardMode}
        onToggleHazard={setHazardMode}
        asteroidCount={stats.total}
        hazardousCount={stats.hazardous}
        loading={loading}
      />

      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        {selectedAsteroid && <InfoPanel asteroid={selectedAsteroid} />}
      </div>

      <Canvas camera={{ position: [0, 5.5, 10], fov: 46 }} gl={{ antialias: true }}>
        <color attach="background" args={['#02040b']} />

        <SpaceBackdrop />
        <Stars radius={100} depth={45} count={7000} factor={4} saturation={0} fade speed={0.35} />

        <ambientLight intensity={0.2} color="#5674aa" />
        <directionalLight position={[6, 4, 5]} intensity={1.4} color="#fff0dc" />
        <pointLight position={[-12, -4, -9]} intensity={0.22} color="#4e6cff" />

        <Earth />
        <Radar enabled={hazardMode} />
        <AsteroidField asteroids={asteroids} hazardMode={hazardMode} onSelect={setSelectedAsteroid} />

        <OrbitControls
          enablePan
          enableZoom
          minDistance={3.8}
          maxDistance={28}
          maxPolarAngle={Math.PI - 0.12}
          minPolarAngle={0.2}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.22} luminanceSmoothing={0.35} intensity={0.78} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default Home;
