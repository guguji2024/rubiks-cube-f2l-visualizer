import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Cubie } from '../store/cubeStore'
import { useCubeStore } from '../store/cubeStore'

// 标准魔方颜色（匹配主流速拧教程）
const COLORS = {
  yellow: '#FFFF00',  // U 上 (y=1): 黄色
  white: '#FFFFFF',   // D 下 (y=-1): 白色
  red: '#FF0000',     // F 前 (z=1): 红色
  orange: '#FFA500',  // B 后 (z=-1): 橙色
  green: '#00FF00',   // R 右 (x=1): 绿色
  blue: '#0000FF',    // L 左 (x=-1): 蓝色
  black: '#1a1a1a'   // 内部面
} as const

// 动画阻尼系数
const ANIMATION_DAMPING = 15

interface CubieMeshProps {
  cubie: Cubie
}

// 根据初始坐标生成 6 个面的材质数组
// BoxGeometry 面索引顺序：[0: 右(x+), 1: 左(x-), 2: 上(y+), 3: 下(y-), 4: 前(z+), 5: 后(z-)]
function createMaterials(position: [number, number, number]): THREE.MeshStandardMaterial[] {
  const [x, y, z] = position

  // 索引 0: 右面 (x=1) -> 绿色
  const rightMat = x === 1
    ? new THREE.MeshStandardMaterial({ color: COLORS.green, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  // 索引 1: 左面 (x=-1) -> 蓝色
  const leftMat = x === -1
    ? new THREE.MeshStandardMaterial({ color: COLORS.blue, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  // 索引 2: 上面 (y=1) -> 黄色
  const topMat = y === 1
    ? new THREE.MeshStandardMaterial({ color: COLORS.yellow, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  // 索引 3: 下面 (y=-1) -> 白色
  const bottomMat = y === -1
    ? new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  // 索引 4: 前面 (z=1) -> 红色
  const frontMat = z === 1
    ? new THREE.MeshStandardMaterial({ color: COLORS.red, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  // 索引 5: 后面 (z=-1) -> 橙色
  const backMat = z === -1
    ? new THREE.MeshStandardMaterial({ color: COLORS.orange, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: COLORS.black })

  return [rightMat, leftMat, topMat, bottomMat, frontMat, backMat]
}

export function CubieMesh({ cubie }: CubieMeshProps) {
  // 材质必须基于"初始坐标"计算
  const initialPosition: [number, number, number] = cubie.id.split(',').map(Number) as [number, number, number]
  const materials = useMemo(() => createMaterials(initialPosition), [initialPosition])

  // 使用 useState 锁死初始位置
  const [initialPos] = useState(() => new THREE.Vector3(...cubie.position))
  const [initialQuat] = useState(() => new THREE.Quaternion(...cubie.quaternion))

  const meshRef = useRef<THREE.Mesh>(null)

  // 监听目标位置和四元数
  const targetPos = useMemo(() => new THREE.Vector3(...cubie.position), [cubie.position])
  const targetQuat = useMemo(() => new THREE.Quaternion(...cubie.quaternion), [cubie.quaternion])

  // 【Phase 4】：读取目标块状态
  const targetCubies = useCubeStore(state => state.targetCubies)
  const isInstant = useCubeStore(state => state.isInstant)
  const isHighlighted = targetCubies.length > 0 && targetCubies.includes(cubie.id)

  // 【Phase 5】：动画处理
  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isInstant) {
      // 瞬间移动到位，跳过插值
      meshRef.current.position.copy(targetPos)
      meshRef.current.quaternion.copy(targetQuat)
    } else {
      // 平滑插值动画
      meshRef.current.position.lerp(targetPos, ANIMATION_DAMPING * delta)
      meshRef.current.quaternion.slerp(targetQuat, ANIMATION_DAMPING * delta)
    }
  })

  // 更新材质透明度（实现高亮效果）
  useEffect(() => {
    materials.forEach(mat => {
      if (isHighlighted) {
        // 目标块：完全不透明，高亮显示
        mat.opacity = 1
        mat.transparent = false
        mat.emissive = new THREE.Color(0x444444)  // 微微发光
      } else if (targetCubies.length > 0) {
        // 非目标块：半透明灰度
        mat.opacity = 0.2
        mat.transparent = true
        mat.color = new THREE.Color(0x888888)  // 灰度
        mat.emissive = new THREE.Color(0x000000)
      } else {
        // 正常状态
        mat.opacity = 1
        mat.transparent = false
        mat.emissive = new THREE.Color(0x000000)
      }
      mat.needsUpdate = true
    })
  }, [isHighlighted, targetCubies.length, materials])

  return (
    <mesh
      ref={meshRef}
      position={initialPos}
      quaternion={initialQuat}
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {materials.map((material, index) => (
        <primitive key={index} object={material} attach={`material-${index}`} />
      ))}
    </mesh>
  )
}
