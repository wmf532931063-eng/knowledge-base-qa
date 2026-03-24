import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ documentCount: 0, files: [] })
  const [rebuilding, setRebuilding] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/knowledge/stats`)
      setStats(res.data)
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  }

  const handleRebuild = async () => {
    setRebuilding(true)
    try {
      await axios.post(`${API_BASE}/knowledge/rebuild`)
      await fetchStats()
      alert('知识库重建成功！')
    } catch (error) {
      console.error('重建知识库失败:', error)
      alert('重建知识库失败: ' + error.message)
    } finally {
      setRebuilding(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    setLoading(true)
    setAnswer('')
    setSources([])

    try {
      const res = await axios.post(`${API_BASE}/qa/ask`, {
        question: question.trim(),
        topK: 5
      })

      setAnswer(res.data.answer)
      setSources(res.data.sources || [])

      // 添加到历史记录
      setHistory(prev => [{
        question: question.trim(),
        answer: res.data.answer,
        sources: res.data.sources || []
      }, ...prev.slice(0, 9)])

      setQuestion('')
    } catch (error) {
      console.error('问答失败:', error)
      setAnswer('抱歉，处理您的问题时发生错误，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>命运主理人</h1>
        <p>基于本地知识库的智能问答系统</p>
      </header>

      <div className="status-bar">
        <div className="status-info">
          <div className="status-item">
            <span>文档片段:</span>
            <span className="count">{stats.documentCount || 0}</span>
          </div>
          <div className="status-item">
            <span>知识文件:</span>
            <span className="count">{stats.files?.length || 0}</span>
          </div>
        </div>
        <button 
          className="rebuild-button" 
          onClick={handleRebuild}
          disabled={rebuilding}
        >
          {rebuilding ? '重建中...' : '重建知识库'}
        </button>
      </div>

      <div className="card">
        <form className="qa-container" onSubmit={handleSubmit}>
          <div className="input-section">
            <div className="input-wrapper">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入您的问题... (Ctrl+Enter 发送)"
                rows={2}
              />
            </div>
            <button 
              type="submit" 
              className="send-button"
              disabled={loading || !question.trim()}
            >
              {loading ? '回答中...' : '发送'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="answer-section">
            <div className="loading">
              <div className="spinner"></div>
              <span>正在思考...</span>
            </div>
          </div>
        )}

        {answer && !loading && (
          <div className="answer-section">
            <div className="answer-content">{answer}</div>
            {sources.length > 0 && (
              <div className="sources">
                <div className="sources-title">参考来源:</div>
                {sources.map((source, index) => (
                  <span key={index} className="source-tag">{source}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#333' }}>问答历史</h3>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-question">Q: {item.question}</div>
                <div className="history-answer">A: {item.answer.substring(0, 150)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '16px', color: '#333' }}>使用说明</h3>
        <div style={{ color: '#666', lineHeight: 1.8 }}>
          <p>1. 在 <code>knowledge-base</code> 目录下添加 Markdown 或 TXT 文件</p>
          <p>2. 点击"重建知识库"按钮构建向量索引</p>
          <p>3. 在上方输入框中提问，系统会从知识库中检索相关内容并回答</p>
          <p>4. 请在 <code>.env</code> 文件中配置腾讯云 API 密钥以启用 AI 对话功能</p>
        </div>
      </div>
    </div>
  )
}

export default App
