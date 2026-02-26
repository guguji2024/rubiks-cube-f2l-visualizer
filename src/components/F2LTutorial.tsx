import { useEffect, useState, useMemo } from 'react'
import { useCubeStore } from '../store/cubeStore'
import { parseFormula } from '../engine/CubeEngine'
import { f2lCases, F2LCase } from '../data/f2lCases'

// 分类元数据
const categoryLabels: Record<string, { label: string; color: string }> = {
  '1. 基础已配对': { label: '🔗 基础已配对', color: '#4a4' },
  '2. 顶层异色': { label: '🔀 顶层异色', color: '#a44' },
  '3. 顶层同色': { label: '🔄 顶层同色', color: '#aa4' },
  '4. 包含底角/槽内': { label: '🎯 槽内/藏角', color: '#44a' }
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  margin: '2px 0',
  fontSize: '13px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #444',
  borderRadius: '4px',
  background: '#333',
  color: '#fff',
  width: '100%',
  textAlign: 'left'
}

const controlButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  minWidth: '80px',
  textAlign: 'center',
  background: '#446'
}

export function F2LTutorial() {
  const {
    setupScenario,
    setTargetCubies,
    clearTargetCubies,
    setFormulaSequence,
    nextStep,
    prevStep,
    clearStep,
    currentFormulaSequence,
    currentStepIndex,
    currentMove,
    currentDescription,
    reset
  } = useCubeStore()

  // 当前选中的分类（用于折叠面板）
  const [expandedCategory, setExpandedCategory] = useState<string | null>('1. 基础已配对')
  // 当前选中的案例 ID
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  // 动态获取所有分类
  const categories = useMemo(() => {
    return [...new Set(f2lCases.map(c => c.category))]
  }, [])

  // 按分类分组的案例数据
  const groupedCases = useMemo(() => {
    const groups: Record<string, F2LCase[]> = {}
    categories.forEach(cat => {
      groups[cat] = f2lCases.filter(c => c.category === cat)
    })
    return groups
  }, [categories])

  // 键盘左右方向键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentFormulaSequence.length === 0) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentStepIndex <= currentFormulaSequence.length) {
          nextStep()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentStepIndex > 0) {
          prevStep()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentFormulaSequence.length, currentStepIndex, nextStep, prevStep])

  // 加载教学案例
  const loadCase = (f2lCase: F2LCase) => {
    // 记录选中的案例
    setSelectedCaseId(f2lCase.id)

    // 重置魔方
    reset()

    // 瞬间设置到打乱状态
    setupScenario(f2lCase.setupFormula)

    // 设置目标块高亮
    setTargetCubies(f2lCase.targetCubies)

    // 解析 formula 字符串为 Move 数组
    const moves = parseFormula(f2lCase.formula)
    setFormulaSequence(moves, f2lCase.stepDescriptions)
  }

  // 清除教学状态
  const clearScenario = () => {
    clearTargetCubies()
    clearStep()
    reset()
    setSelectedCaseId(null)
  }

  // 切换分类展开状态
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  // 当前选中的案例信息
  const selectedCase = selectedCaseId ? f2lCases.find(c => c.id === selectedCaseId) : null

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      padding: '16px',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'monospace',
      width: '320px',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 12px 0', textAlign: 'center', color: '#8cf' }}>
        F2L 算法图鉴
      </h3>

      {/* 左侧分类目录 */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>选择情况 · 共 {f2lCases.length} 种</span>

        <div style={{ marginTop: '8px' }}>
          {categories.map(category => {
            const meta = categoryLabels[category] || { label: category, color: '#444' }
            const cases = groupedCases[category] || []
            return (
              <div key={category} style={{ marginBottom: '4px' }}>
                {/* 分类标题按钮 */}
                <button
                  onClick={() => toggleCategory(category)}
                  style={{
                    ...buttonStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: meta.color,
                    opacity: 0.85
                  }}
                >
                  <span>{meta.label}</span>
                  <span style={{ fontSize: '11px' }}>
                    {expandedCategory === category ? '▼' : '▶'} ({cases.length})
                  </span>
                </button>

                {/* 分类下的案例列表 */}
                {expandedCategory === category && (
                  <div style={{ paddingLeft: '8px' }}>
                    {cases.map(f2lCase => (
                      <button
                        key={f2lCase.id}
                        onClick={() => loadCase(f2lCase)}
                        style={{
                          ...buttonStyle,
                          background: selectedCaseId === f2lCase.id ? '#484' : '#3a3a3a',
                          borderLeft: selectedCaseId === f2lCase.id ? '3px solid #8f8' : '1px solid #444'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                          {f2lCase.id}: {f2lCase.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 元情况说明 */}
      <div style={{
        background: '#222',
        padding: '8px',
        borderRadius: '4px',
        marginBottom: '12px',
        fontSize: '11px',
        color: '#aaa'
      }}>
        <div style={{ color: '#8cf', fontWeight: 'bold', marginBottom: '4px' }}>F2L 元情况</div>
        <div>• 🔗 基础入槽：角棱已配对</div>
        <div>• 🔀 异色配对：白面朝侧</div>
        <div>• 🔄 同色藏角：白面朝同色</div>
      </div>

      {/* 播放控制区 */}
      {currentFormulaSequence.length > 0 && (
        <div style={{
          borderTop: '1px solid #444',
          paddingTop: '12px'
        }}>
          <span style={{ fontSize: '12px', color: '#888' }}>播放控制 (← →)</span>

          {/* 当前案例信息 */}
          {selectedCase && (
            <div style={{
              background: '#1a3a2a',
              padding: '6px 8px',
              borderRadius: '4px',
              margin: '8px 0',
              fontSize: '11px',
              borderLeft: '3px solid #4a8'
            }}>
              <div style={{ color: '#4f8', fontWeight: 'bold' }}>{selectedCase.id}</div>
              <div style={{ color: '#ccc' }}>{selectedCase.name}</div>
            </div>
          )}

          {/* 当前状态显示 */}
          <div style={{
            background: '#222',
            padding: '8px',
            borderRadius: '4px',
            margin: '8px 0',
            textAlign: 'center',
            fontSize: '13px'
          }}>
            {currentStepIndex === 0 && (
              <span style={{ color: '#888' }}>点击"下一步"或按 → 开始</span>
            )}
            {currentStepIndex > 0 && currentStepIndex <= currentFormulaSequence.length && (
              <span style={{ color: '#f88' }}>
                步骤 {currentStepIndex} / {currentFormulaSequence.length}
                {currentMove && <span style={{ marginLeft: '8px' }}>执行: {currentMove}</span>}
              </span>
            )}
            {currentStepIndex > currentFormulaSequence.length && (
              <span style={{ color: '#4f4' }}>完成!</span>
            )}
          </div>

          {/* 固定高度解说面板 */}
          <div style={{ minHeight: '100px', marginBottom: '8px' }}>
            {currentDescription ? (
              <div style={{
                background: 'linear-gradient(135deg, #2a4a6a 0%, #1a3a5a 100%)',
                border: '1px solid #4a8ac4',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                height: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontWeight: 'bold', color: '#8cf', marginBottom: '6px' }}>
                  步骤 {currentStepIndex}
                </div>
                {currentDescription}
              </div>
            ) : (
              <div style={{
                background: '#222',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '12px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '12px'
              }}>
                按 → 键开始观察
              </div>
            )}
          </div>

          {/* 动作序列显示 */}
          <div style={{
            fontSize: '11px',
            color: '#888',
            marginBottom: '8px',
            wordBreak: 'break-all'
          }}>
            公式: {currentFormulaSequence.join(' ')}
          </div>

          {/* 控制按钮 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
            <button
              style={controlButtonStyle}
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              ← 上一步
            </button>
            <button
              style={{ ...controlButtonStyle, background: '#48c' }}
              onClick={nextStep}
              disabled={currentStepIndex > currentFormulaSequence.length}
            >
              下一步 →
            </button>
          </div>

          <button
            style={{ ...buttonStyle, width: '100%', marginTop: '8px', background: '#844' }}
            onClick={clearScenario}
          >
            退出教学
          </button>
        </div>
      )}

      {/* 帮助说明 */}
      <div style={{
        borderTop: '1px solid #444',
        paddingTop: '12px',
        marginTop: '12px',
        fontSize: '11px',
        color: '#666'
      }}>
        <p>F2L 核心思想：</p>
        <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
          <li><b>配对</b>：顶层把角块和棱块组合</li>
          <li><b>入槽</b>：整体插入目标槽位</li>
          <li>41 种情况 → 3 种元情况</li>
          <li style={{ marginTop: '6px', color: '#8cf' }}>💡 按 ← → 键快速翻页</li>
        </ul>
      </div>
    </div>
  )
}
