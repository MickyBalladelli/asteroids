import { memo } from 'react'
import Asteroid from './Asteroid'
import AsteroidOrbit from './AsteroidOrbit'

function AsteroidField({
  asteroids,
  hazardMode,
  onSelect,
  selectedId,
  positionsRef,
  onHover,
  onHoverEnd,
}) {
  return (
    <group>
      {asteroids.map((asteroid) => (
        <group key={asteroid.id}>
          <AsteroidOrbit
            asteroid={asteroid}
            orbit={asteroid.orbit}
            hazardMode={hazardMode}
            hazardous={asteroid.hazardous}
            isSelected={asteroid.id === selectedId}
            threatScore={asteroid.threatScore}
            earthCrossing={asteroid.earthCrossing}
            onSelect={onSelect}
            onHover={onHover}
            onHoverEnd={onHoverEnd}
          />
          <Asteroid
            asteroid={asteroid}
            hazardMode={hazardMode}
            onSelect={onSelect}
            isSelected={asteroid.id === selectedId}
            positionsRef={positionsRef}
            onHover={onHover}
            onHoverEnd={onHoverEnd}
          />
        </group>
      ))}
    </group>
  )
}

export default memo(AsteroidField)
