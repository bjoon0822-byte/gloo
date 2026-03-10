import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 전역 에러 바운더리 — 앱 크래시 시 친절한 메시지 표시
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '2rem', fontFamily: 'Pretendard, sans-serif',
          background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', color: '#1a1020'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>⚠️ 오류가 발생했습니다</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '400px' }}>
            일시적인 오류가 발생했습니다. 페이지를 새로고침해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #9333ea, #c084fc)', color: 'white',
              fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 15px rgba(147,51,234,0.3)'
            }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
