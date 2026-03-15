import { memo } from 'react'
import Asteroid from './Asteroid'
import AsteroidOrbit from './AsteroidOrbit'

function AsteroidField({ asteroids, hazardMode, onSelect, selectedId, positionsRef }) {
  return (
    <group>
      {asteroids.map((asteroid) => (
        <group key={asteroid.id}>
          <AsteroidOrbit
            orbit={asteroid.orbit}
            hazardMode={hazardMode}
            hazardous={asteroid.hazardous}
            isSelected={asteroid.id === selectedId}
          />
          <Asteroid
            asteroid={asteroid}
            hazardMode={hazardMode}
            onSelect={onSelect}
            isSelected={asteroid.id === selectedId}
            positionsRef={positionsRef}
          />
        </group>
      ))}
    </group>
  )
}

export default memo(AsteroidField)
