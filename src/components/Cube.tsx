import { useCubeStore } from '../store/cubeStore'
import { CubieMesh } from './CubieMesh'

export function Cube() {
  const cubies = useCubeStore((state) => state.cubies)

  return (
    <group>
      {cubies.map((cubie) => (
        <CubieMesh key={cubie.id} cubie={cubie} />
      ))}
    </group>
  )
}
