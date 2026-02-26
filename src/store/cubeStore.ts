import { create } from 'zustand'
import { Vector3, Quaternion } from 'three'
import { parseFormula, inverseMove, type Move, isValidMove } from '../engine/CubeEngine'

// 魔方块类型定义
export interface Cubie {
  id: string                    // 例如 "1,1,1" 表示坐标
  position: [number, number, number]  // 空间逻辑坐标，取值 -1, 0, 1
  quaternion: [number, number, number, number]  // 四元数 [x, y, z, w]
}

// 初始化 26 个魔方块（排除中心的 0,0,0 核心块）
function createInitialCubies(): Cubie[] {
  const cubies: Cubie[] = []

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue

        cubies.push({
          id: `${x},${y},${z}`,
          position: [x, y, z],
          quaternion: [0, 0, 0, 1]
        })
      }
    }
  }

  return cubies
}

// 通用旋转函数
function rotateCubies(
  cubies: Cubie[],
  axis: 'x' | 'y' | 'z',
  layerIndex: -1 | 0 | 1,
  angle: number
): Cubie[] {
  const axisVector = axis === 'x' ? new Vector3(1, 0, 0) :
                     axis === 'y' ? new Vector3(0, 1, 0) :
                     new Vector3(0, 0, 1)

  const rotateQ = new Quaternion().setFromAxisAngle(axisVector, angle)

  return cubies.map(cubie => {
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2

    if (cubie.position[axisIndex] !== layerIndex) {
      return {
        id: cubie.id,
        position: [...cubie.position] as [number, number, number],
        quaternion: [...cubie.quaternion] as [number, number, number, number]
      }
    }

    const pos = new Vector3(...cubie.position)
    pos.applyQuaternion(rotateQ)

    const newPosition: [number, number, number] = [
      Math.round(pos.x),
      Math.round(pos.y),
      Math.round(pos.z)
    ]

    const oldQ = new Quaternion(cubie.quaternion[0], cubie.quaternion[1], cubie.quaternion[2], cubie.quaternion[3])
    const newQ = oldQ.premultiply(rotateQ)

    return {
      id: cubie.id,
      position: newPosition,
      quaternion: [newQ.x, newQ.y, newQ.z, newQ.w] as [number, number, number, number]
    }
  })
}

// Singmaster 标准转动方法
export const R = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'x', 1, -Math.PI / 2)

export const R_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'x', 1, Math.PI / 2)

export const L = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'x', -1, Math.PI / 2)

export const L_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'x', -1, -Math.PI / 2)

export const U = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'y', 1, -Math.PI / 2)

export const U_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'y', 1, Math.PI / 2)

export const D = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'y', -1, -Math.PI / 2)

export const D_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'y', -1, Math.PI / 2)

export const F = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'z', 1, -Math.PI / 2)

export const F_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'z', 1, Math.PI / 2)

export const B = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'z', -1, Math.PI / 2)

export const B_prime = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'z', -1, -Math.PI / 2)

export const R2 = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'x', 1, Math.PI)

export const U2 = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'y', 1, Math.PI)

export const F2 = (cubies: Cubie[]): Cubie[] =>
  rotateCubies(cubies, 'z', 1, Math.PI)

// 动作映射表
const MOVE_FUNCTIONS: Record<string, (cubies: Cubie[]) => Cubie[]> = {
  'R': R, 'R\'': R_prime, 'R2': R2,
  'L': L, 'L\'': L_prime, 'L2': (c) => R2(c),
  'U': U, 'U\'': U_prime, 'U2': U2,
  'D': D, 'D\'': D_prime, 'D2': (c) => U2(c),
  'F': F, 'F\'': F_prime, 'F2': F2,
  'B': B, 'B\'': B_prime, 'B2': (c) => F2(c)
}

// 执行单个动作
function executeMove(cubies: Cubie[], move: string): Cubie[] {
  const fn = MOVE_FUNCTIONS[move]
  if (!fn) {
    console.warn(`未知动作: ${move}`)
    return cubies
  }
  return fn(cubies)
}

// Zustand Store 类型
interface CubeStore {
  cubies: Cubie[]
  targetCubies: string[]
  isPlaying: boolean
  isInstant: boolean  // 是否瞬间移动（跳过动画）

  // 单步播放相关
  currentFormulaSequence: Move[]  // 当前教学公式拆解后的数组
  currentStepIndex: number        // 当前执行到了第几步
  currentMove: string | null      // 当前正在执行的步骤名称
  stepDescriptions: string[]     // 与 currentFormulaSequence 一一对应的中文解说词
  currentDescription: string      // 当前步骤的解说词

  // 动作方法
  R: () => void
  R_prime: () => void
  L: () => void
  L_prime: () => void
  U: () => void
  U_prime: () => void
  D: () => void
  D_prime: () => void
  F: () => void
  F_prime: () => void
  B: () => void
  B_prime: () => void
  R2: () => void
  U2: () => void
  F2: () => void
  reset: () => void

  // 目标块追踪方法
  setTargetCubies: (ids: string[]) => void
  clearTargetCubies: () => void

  // 公式播放方法
  playFormula: (formula: string, tps?: number) => Promise<void>

  // 瞬间预设方法
  setupScenario: (formula: string) => void

  // 单步播放方法
  setFormulaSequence: (moves: Move[], descriptions?: string[]) => void
  nextStep: () => void
  prevStep: () => void
  clearStep: () => void
}

// 创建 Zustand store
export const useCubeStore = create<CubeStore>((set, get) => ({
  cubies: createInitialCubies(),
  targetCubies: [],
  isPlaying: false,
  isInstant: false,
  currentFormulaSequence: [],
  stepDescriptions: [],
  currentStepIndex: 0,
  currentMove: null,
  currentDescription: '',

  // 顺时针转动
  R: () => set((state) => ({ cubies: R(state.cubies) })),
  L: () => set((state) => ({ cubies: L(state.cubies) })),
  U: () => set((state) => ({ cubies: U(state.cubies) })),
  D: () => set((state) => ({ cubies: D(state.cubies) })),
  F: () => set((state) => ({ cubies: F(state.cubies) })),
  B: () => set((state) => ({ cubies: B(state.cubies) })),

  // 逆时针转动
  R_prime: () => set((state) => ({ cubies: R_prime(state.cubies) })),
  L_prime: () => set((state) => ({ cubies: L_prime(state.cubies) })),
  U_prime: () => set((state) => ({ cubies: U_prime(state.cubies) })),
  D_prime: () => set((state) => ({ cubies: D_prime(state.cubies) })),
  F_prime: () => set((state) => ({ cubies: F_prime(state.cubies) })),
  B_prime: () => set((state) => ({ cubies: B_prime(state.cubies) })),

  // 180度转动
  R2: () => set((state) => ({ cubies: R2(state.cubies) })),
  U2: () => set((state) => ({ cubies: U2(state.cubies) })),
  F2: () => set((state) => ({ cubies: F2(state.cubies) })),

  // 重置
  reset: () => set({
    cubies: createInitialCubies(),
    targetCubies: [],
    isInstant: false,
    currentFormulaSequence: [],
    stepDescriptions: [],
    currentStepIndex: 0,
    currentMove: null,
    currentDescription: ''
  }),

  // 目标块追踪
  setTargetCubies: (ids: string[]) => set({ targetCubies: ids }),
  clearTargetCubies: () => set({ targetCubies: [] }),

  // 公式播放
  playFormula: async (formula: string, tps: number = 4) => {
    const moves = parseFormula(formula)

    if (moves.length === 0) {
      console.warn('无效的公式')
      return
    }

    const delay = 1000 / tps

    set({ isPlaying: true })

    try {
      for (const move of moves) {
        get().cubies = executeMove(get().cubies, move)
        set({ cubies: [...get().cubies] })

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } finally {
      set({ isPlaying: false })
    }
  },

  // 【核心任务 1】：瞬间预设功能
  setupScenario: (formula: string) => {
    const moves = parseFormula(formula)

    if (moves.length === 0) {
      console.warn('无效的预设公式')
      return
    }

    // 瞬间应用所有动作
    let newCubies = get().cubies
    for (const move of moves) {
      newCubies = executeMove(newCubies, move)
    }

    // 设置瞬间模式并更新状态
    set({
      cubies: newCubies,
      isInstant: true
    })

    // 50ms 后恢复正常动画模式
    setTimeout(() => {
      set({ isInstant: false })
    }, 50)
  },

  // 【核心任务 2】：单步播放控制
  setFormulaSequence: (moves: Move[], descriptions: string[] = []) => set({
    currentFormulaSequence: moves,
    stepDescriptions: descriptions,
    currentStepIndex: 0,
    currentMove: null,
    currentDescription: ''
  }),

  nextStep: () => {
    const { currentFormulaSequence, stepDescriptions, currentStepIndex, cubies } = get()

    if (currentStepIndex >= currentFormulaSequence.length) {
      return  // 已经播放完毕
    }

    const move = currentFormulaSequence[currentStepIndex]
    const newCubies = executeMove(cubies, move)
    const description = stepDescriptions[currentStepIndex] || ''

    set({
      cubies: newCubies,
      currentStepIndex: currentStepIndex + 1,
      currentMove: move,
      currentDescription: description
    })
  },

  prevStep: () => {
    const { currentFormulaSequence, stepDescriptions, currentStepIndex, cubies } = get()

    if (currentStepIndex <= 0) {
      return  // 已经是最开始
    }

    // 获取上一步的动作，求逆后执行
    const prevMove = currentFormulaSequence[currentStepIndex - 1]
    const inverseMoveStr = isValidMove(prevMove) ? inverseMove(prevMove) : prevMove

    const newCubies = executeMove(cubies, inverseMoveStr)
    // 回退后显示上一步的解说词
    const prevDescription = stepDescriptions[currentStepIndex - 2] || ''

    set({
      cubies: newCubies,
      currentStepIndex: currentStepIndex - 1,
      currentMove: null,
      currentDescription: prevDescription
    })
  },

  clearStep: () => set({
    currentFormulaSequence: [],
    stepDescriptions: [],
    currentStepIndex: 0,
    currentMove: null,
    currentDescription: ''
  })
}))
