import { memo } from 'react'
import Asteroid from './Asteroid'
import AsteroidOrbit from './AsteroidOrbit'

function AsteroidField({ asteroids, hazardMode, onSelect }) {
  return (
    <group>
      {asteroids.map((asteroid) => (
        <group key={asteroid.id}>
          <AsteroidOrbit
            orbit={asteroid.orbit}
            hazardMode={hazardMode}
            hazardous={asteroid.hazardous}
          />
          <Asteroid
            asteroid={asteroid}
            hazardMode={hazardMode}
            onSelect={onSelect}
          />
        </group>
      ))}
    </group>
  )
}

export default memo(AsteroidField)
