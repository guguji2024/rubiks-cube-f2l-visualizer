import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Cube } from './components/Cube'
import { ControlPanel } from './components/ControlPanel'
import { F2LTutorial } from './components/F2LTutorial'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a', position: 'relative' }}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        {/* 基础光照 */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* 魔方主体 */}
        <Cube />

        {/* 轨道控制器，支持鼠标拖拽旋转视角 */}
        <OrbitControls />
      </Canvas>

      {/* F2L 教学面板 */}
      <F2LTutorial />

      {/* 控制面板 */}
      <ControlPanel />
    </div>
  )
}

export default App
