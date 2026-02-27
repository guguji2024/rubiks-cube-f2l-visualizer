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

---

## Phase 6 完成总结 (F2L 核心架构)

### 已完成工作

1. **3D 动画瞬移系统**
   - `setupScenario(formula)` 瞬间预设功能
   - `isInstant` 状态控制动画/瞬移切换
   - 50ms 后自动恢复正常动画模式

2. **F2L 核心架构搭建**
   - 创建数据源文件 `src/data/f2lCases.ts`
   - 定义 `F2LCase` 接口和 4 大分类
   - 分类：基础已配对、顶层异色、顶层同色、槽内/藏角

3. **前 8 种 F2L 基础情况数据录入**
   - 每类各 2 个典型案例
   - 包含 setupFormula、formula、stepDescriptions
   - 解说词中明确标注"转化为 xxx 元情况"

4. **F2LTutorial.tsx UI 重构**
   - 左侧分类折叠菜单
   - 动态分组渲染
   - 保留所有播放控制、键盘快捷键 (← →)

5. **部署上线**
   - Vercel 部署成功

---

## Phase 7 待办事项

### 目标：补全剩余 33 种 F2L 公式数据

F2L 共有 41 种情况，目前已录入 8 种，还需补全 33 种。

### 数据结构规范（已验证）
```typescript
interface F2LCase {
  id: string;           // 如 "F2L-09"
  category: string;    // 4 大分类之一
  name: string;         // 情况名称
  targetCubies: string[];  // ['1,-1,1', '1,0,1']
  setupFormula: string;    // 打乱公式（逆向生成）
  formula: string;         // 解决公式
  stepDescriptions: string[];  // 解说词数组
}
```

### 分类待补充数量
- 1. 基础已配对：还需 ~10 种
- 2. 顶层异色：还需 ~8 种
- 3. 顶层同色：还需 ~8 种
- 4. 槽内/藏角：还需 ~7 种

### 核心原则
- 41 种 → 3 种元情况（基础入槽、异色配对、同色藏角）
- 解说词需明确标注"已转化为 xxx 元情况"
- 目标块固定为底前右槽：`targetCubies: ['1,-1,1', '1,0,1']`
