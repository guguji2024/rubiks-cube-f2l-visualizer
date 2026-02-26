# 魔方速拧可视化项目

## 技术栈
- React 18 + TypeScript
- React Three Fiber (R3F) + @react-three/drei
- Zustand (状态管理)
- Three.js (数学计算)
- Vite (构建工具)

## 核心文件结构

```
src/
├── store/
│   └── cubeStore.ts       # Zustand 状态机
├── engine/
│   └── CubeEngine.ts      # 群论解析引擎
├── components/
│   ├── Cube.tsx           # 魔方容器
│   ├── CubieMesh.tsx     # 单块渲染（含动画）
│   ├── ControlPanel.tsx  # 手动控制面板
│   └── F2LTutorial.tsx   # F2L 教学模块
└── App.tsx
```

## cubeStore.ts 核心状态

```typescript
interface CubeStore {
  cubies: Cubie[]                    // 26 个魔方块数组
  targetCubies: string[]             // 高亮目标块 ID 数组
  isInstant: boolean                 // 是否瞬间移动（跳过动画）
  currentFormulaSequence: Move[]    // 当前教学公式动作序列
  currentStepIndex: number          // 当前步骤索引
  stepDescriptions: string[]          // 对应步骤的中文解说
  currentDescription: string         // 当前显示的解说词
}
```

### 核心方法
- `setupScenario(formula)` - 瞬间预设场景
- `setFormulaSequence(moves, descriptions)` - 设置教学序列
- `nextStep() / prevStep()` - 单步播放控制
- `playFormula(formula, tps)` - 连续播放公式
- `setTargetCubies(ids)` - 设置高亮块

## CubeEngine.ts 支持的语法

### 基础动作
- 顺时针: `R`, `U`, `F`, `L`, `D`, `B`
- 逆时针: `R'`, `U'`, `F'`, `L'`, `D'`, `B'`
- 180度: `R2`, `U2`, `F2`, `L2`, `D2`, `B2`

### 换位子 (Commutator)
- 语法: `[A, B]` 展开为 `A B A' B'`
- 示例: `[R, U]` → `R U R' U'`

### 逆运算
- `inverseMove('R')` → `'R'`
- `inverseMove('R2')` → `'R2'`
- `inverseArray(['R', 'U'])` → `['U', 'R']`

## 魔方坐标与颜色映射

### 坐标系统 (右手坐标系)
- x = 1: 右 (R)
- x = -1: 左 (L)
- y = 1: 上 (U)
- y = -1: 下 (D)
- z = 1: 前 (F)
- z = -1: 后 (B)

### BoxGeometry 材质数组索引
```
[0: 右(x+), 1: 左(x-), 2: 上(y+), 3: 下(y-), 4: 前(z+), 5: 后(z-)]
```

### 标准配色（必须严格遵守）
| 坐标 | 面 | 颜色代码 |
|------|-----|----------|
| y = 1 | U (上) | 黄色 `#FFFF00` |
| y = -1 | D (下) | 白色 `#FFFFFF` |
| z = 1 | F (前) | 红色 `#FF0000` |
| z = -1 | B (后) | 橙色 `#FFA500` |
| x = 1 | R (右) | 绿色 `#00FF00` |
| x = -1 | L (左) | 蓝色 `#0000FF` |

### 内部面
- 非朝外面: 黑色 `#1a1a1a`

## 旋转方向约定

### Singmaster 标准（正视该面顺时针）
- 正半轴面 (U, R, F): 顺时针 = `-Math.PI / 2`
- 负半轴面 (D, L, B): 顺时针 = `+Math.PI / 2`

### 旋转实现
- 使用 Three.js `Quaternion.premultiply()` 实现世界坐标旋转
- 旋转后必须 `Math.round()` 修正浮点误差
- 材质绑定到 `cubie.id` 解析的初始坐标，永不改变

## 动画系统

### CubieMesh 动画逻辑
1. 使用 `useState` 锁死初始 `position` 和 `quaternion`
2. 使用 `useMemo` 监听 Zustand 目标值
3. `useFrame` 中根据 `isInstant` 决定：
   - `true`: `copy()` 瞬间到位
   - `false`: `lerp/slerp` 平滑插值

### 动画参数
```typescript
const ANIMATION_DAMPING = 15  // 阻尼系数
```
