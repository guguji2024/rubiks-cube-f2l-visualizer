/**
 * 魔方群论引擎 v2
 * 负责解析公式字符串，支持换位子语法和逆动作推导
 *
 * 解析规范：
 * - 基础动作: R, R', R2, U, U', F, F', etc.
 * - 换位子: [A, B] -> A B A' B'
 * - 圆括号: 仅作视觉分组，直接剔除
 */

// 动作类型
export type Move = string

// 有效的基础动作（不带修饰符）
const BASES = ['U', 'D', 'F', 'B', 'R', 'L'] as const

// 有效的修饰符
type Modifier = '' | '2' | "'"

type Base = typeof BASES[number]
type ValidMove = `${Base}${Modifier}`

// 完整的有效动作列表
const VALID_MOVES: ValidMove[] = [
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'F', "F'", 'F2',
  'B', "B'", 'B2'
]

/**
 * 判断是否为有效动作
 */
export function isValidMove(move: string): move is ValidMove {
  return VALID_MOVES.includes(move as ValidMove)
}

/**
 * 获取单个动作的逆动作
 * R -> R'
 * R' -> R
 * R2 -> R2
 */
export function inverseMove(move: ValidMove): ValidMove {
  // 处理 180 度
  if (move.endsWith('2')) {
    return move
  }

  // 处理顺逆时针
  if (move.endsWith("'")) {
    // R' -> R (去掉 ')
    return move.slice(0, -1) as ValidMove
  } else {
    // R -> R (加上 ')
    return (move + "'") as ValidMove
  }
}

/**
 * 逆转整个动作数组
 * - 反转数组顺序
 * - 每个动作取逆
 *
 * 例如: [R, U, R', U'] -> [U, R, U', R']
 */
export function inverseArray(moves: Move[]): Move[] {
  const result: Move[] = []

  // 逆序遍历
  for (let i = moves.length - 1; i >= 0; i--) {
    const move = moves[i]

    if (isValidMove(move)) {
      result.push(inverseMove(move))
    } else {
      // 如果不是有效动作，直接保留（原样反转顺序）
      result.push(move)
    }
  }

  return result
}

/**
 * 解析换位子 [A, B] -> A B A' B'
 */
function parseCommutator(commutatorStr: string): Move[] {
  // 提取方括号内的内容: [A, B] -> A, B
  const inner = commutatorStr.slice(1, -1)

  // 按逗号分割，注意处理空格
  const parts = inner.split(',').map(s => s.trim())

  if (parts.length !== 2) {
    console.warn(`无效的换位子格式: ${commutatorStr}`)
    return []
  }

  const [a, b] = parts

  // 递归解析 A 和 B（它们可能是嵌套的换位子或普通序列）
  const movesA = parseFormula(a)
  const movesB = parseFormula(b)

  // 展开为 A B A' B'
  return [
    ...movesA,
    ...movesB,
    ...inverseArray(movesA),
    ...inverseArray(movesB)
  ]
}

/**
 * 主解析函数
 * @param input 公式字符串，如 "R U R' U'" 或 "[R, U]"
 * @returns 动作数组
 */
export function parseFormula(input: string): Move[] {
  if (!input || typeof input !== 'string') {
    return []
  }

  // 预处理：剔除圆括号（仅作视觉分组，不影响执行）
  let processed = input.replace(/[()]/g, '')

  // 检查是否包含换位子语法 [A, B]
  if (processed.includes('[') && processed.includes(']')) {
    // 提取所有换位子并解析
    const result: Move[] = []
    let remaining = processed

    while (remaining.length > 0) {
      // 找到下一个换位子的开始
      const bracketStart = remaining.indexOf('[')

      if (bracketStart === -1) {
        // 没有更多换位子，解析剩余的基础动作
        result.push(...extractBasicMoves(remaining))
        break
      }

      // 添加换位子之前的动作
      if (bracketStart > 0) {
        const before = remaining.slice(0, bracketStart)
        result.push(...extractBasicMoves(before))
      }

      // 找到匹配的结束方括号
      const bracketEnd = remaining.indexOf(']', bracketStart)
      if (bracketEnd === -1) {
        console.warn('未找到匹配的方括号')
        break
      }

      // 解析换位子
      const commutator = remaining.slice(bracketStart, bracketEnd + 1)
      result.push(...parseCommutator(commutator))

      // 继续处理剩余部分
      remaining = remaining.slice(bracketEnd + 1)
    }

    return result
  }

  // 没有换位子，直接提取基础动作
  return extractBasicMoves(processed)
}

/**
 * 提取基础动作
 * 使用正则表达式 /[UDFBRL][2']?/g 匹配
 */
function extractBasicMoves(input: string): Move[] {
  // 移除多余空格
  const cleaned = input.replace(/\s+/g, '')

  // 使用正则提取基础动作：字母 + 可选的 2 或 '
  const matches = cleaned.match(/[UDFBRL][2']?/g) || []

  // 过滤保留有效动作
  return matches.filter((move): move is ValidMove => isValidMove(move))
}

/**
 * 格式化动作数组为可读字符串
 */
export function formatMoves(moves: Move[]): string {
  return moves.join(' ')
}
