import { useState } from 'react'
import { useCubeStore } from '../store/cubeStore'

// 按钮样式
const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  margin: '4px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #444',
  borderRadius: '4px',
  background: '#333',
  color: '#fff',
  minWidth: '40px'
}

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  margin: '8px'
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  marginBottom: '8px',
  fontSize: '14px',
  fontFamily: 'monospace',
  background: '#222',
  border: '1px solid #444',
  borderRadius: '4px',
  color: '#fff',
  boxSizing: 'border-box'
}

export function ControlPanel() {
  const {
    R, R_prime, R2,
    L, L_prime,
    U, U_prime, U2,
    D, D_prime,
    F, F_prime, F2,
    B, B_prime,
    reset,
    playFormula,
    isPlaying,
    setTargetCubies,
    clearTargetCubies
  } = useCubeStore()

  const [formulaInput, setFormulaInput] = useState('[R, U]')

  const handlePlayFormula = () => {
    playFormula(formulaInput, 4)  // 默认 4 TPS
  }

  // 测试 F2L 高亮（选择右上角两个块作为示例）
  const handleHighlightF2L = () => {
    setTargetCubies(['1,1,1', '1,0,1'])
  }

  // 测试另一个 F2L 目标
  const handleHighlightF2L2 = () => {
    setTargetCubies(['-1,1,1', '-1,0,1'])
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '16px',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'monospace',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>魔方控制面板</h3>

      {/* 公式播放区域 */}
      <div style={{ ...buttonGroupStyle, borderBottom: '1px solid #444', paddingBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>公式播放</span>
        <input
          style={inputStyle}
          value={formulaInput}
          onChange={(e) => setFormulaInput(e.target.value)}
          placeholder="输入公式，如: R U R' U' 或 [R, U]"
        />
        <button
          style={{ ...buttonStyle, width: '100%', background: '#48c' }}
          onClick={handlePlayFormula}
          disabled={isPlaying}
        >
          {isPlaying ? '播放中...' : '播放公式'}
        </button>
      </div>

      {/* 目标块追踪 */}
      <div style={{ ...buttonGroupStyle, borderBottom: '1px solid #444', paddingBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>目标块追踪 (F2L)</span>
        <div style={rowStyle}>
          <button style={{ ...buttonStyle, background: '#484' }} onClick={handleHighlightF2L}>
            高亮 F2L-1
          </button>
          <button style={{ ...buttonStyle, background: '#484' }} onClick={handleHighlightF2L2}>
            高亮 F2L-2
          </button>
        </div>
        <button
          style={{ ...buttonStyle, width: '100%', background: '#844' }}
          onClick={clearTargetCubies}
        >
          清除高亮
        </button>
      </div>

      {/* U 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>U 层 (上)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={U}>U</button>
          <button style={buttonStyle} onClick={U_prime}>U'</button>
          <button style={buttonStyle} onClick={U2}>U2</button>
        </div>
      </div>

      {/* D 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>D 层 (下)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={D}>D</button>
          <button style={buttonStyle} onClick={D_prime}>D'</button>
        </div>
      </div>

      {/* R 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>R 层 (右)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={R}>R</button>
          <button style={buttonStyle} onClick={R_prime}>R'</button>
          <button style={buttonStyle} onClick={R2}>R2</button>
        </div>
      </div>

      {/* L 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>L 层 (左)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={L}>L</button>
          <button style={buttonStyle} onClick={L_prime}>L'</button>
        </div>
      </div>

      {/* F 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>F 层 (前)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={F}>F</button>
          <button style={buttonStyle} onClick={F_prime}>F'</button>
          <button style={buttonStyle} onClick={F2}>F2</button>
        </div>
      </div>

      {/* B 层 */}
      <div style={buttonGroupStyle}>
        <span style={{ fontSize: '12px', color: '#888' }}>B 层 (后)</span>
        <div style={rowStyle}>
          <button style={buttonStyle} onClick={B}>B</button>
          <button style={buttonStyle} onClick={B_prime}>B'</button>
        </div>
      </div>

      {/* 重置 */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          style={{ ...buttonStyle, background: '#c44', width: '100%' }}
          onClick={reset}
        >
          重置 (Reset)
        </button>
      </div>
    </div>
  )
}
