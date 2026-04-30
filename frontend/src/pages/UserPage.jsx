import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE = ''

function UserPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sentHistory, setSentHistory] = useState([])

  useEffect(() => {
    fetchRoomInfo()
  }, [roomId])

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      } else {
        setError('房间不存在')
      }
    } catch (error) {
      setError('加载房间信息失败')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('请输入弹幕内容')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}/danmakus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          nickname: nickname.trim() || '匿名用户'
        })
      })

      if (response.ok) {
        setSuccess('弹幕发送成功！')
        setSentHistory(prev => [
          { id: Date.now(), content: content.trim(), nickname: nickname.trim() || '匿名用户' },
          ...prev.slice(0, 9)
        ])
        setContent('')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const data = await response.json()
        setError(data.error || '发送失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const quickEmojis = ['👍', '❤️', '🎉', '😂', '👏', '🔥', '💯', '✨']

  const insertEmoji = (emoji) => {
    setContent(prev => prev + emoji)
  }

  if (error === '房间不存在') {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorIcon}>❌</div>
        <h2 style={styles.errorTitle}>房间不存在</h2>
        <p style={styles.errorText}>请检查二维码或链接是否正确</p>
        <button
          onClick={() => navigate('/')}
          style={styles.backButton}
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎤 {room?.name || '你说'}</h1>
          <p style={styles.subtitle}>发送弹幕，参与互动</p>
        </div>
      </header>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>昵称（可选）</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称，默认为匿名用户"
              style={styles.input}
              maxLength={20}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>弹幕内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入你想说的话..."
              style={styles.textarea}
              maxLength={100}
              required
            />
            <div style={styles.charCount}>
              {content.length}/100
            </div>
          </div>

          <div style={styles.emojiSection}>
            <p style={styles.emojiLabel}>快捷表情：</p>
            <div style={styles.emojiGrid}>
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  style={styles.emojiButton}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={styles.successMessage}>
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            style={{
              ...styles.submitButton,
              opacity: (loading || !content.trim()) ? 0.6 : 1,
              cursor: (loading || !content.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '发送中...' : '🚀 发送弹幕'}
          </button>
        </form>

        {sentHistory.length > 0 && (
          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>📝 发送历史</h3>
            <div style={styles.historyList}>
              {sentHistory.map((item) => (
                <div key={item.id} style={styles.historyItem}>
                  <span style={styles.historyNickname}>{item.nickname}:</span>
                  <span style={styles.historyContent}>{item.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    padding: '30px 20px',
    textAlign: 'center'
  },
  headerContent: {
    maxWidth: '400px',
    margin: '0 auto'
  },
  title: {
    fontSize: '28px',
    color: 'white',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '8px'
  },
  content: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    resize: 'none',
    height: '120px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  charCount: {
    textAlign: 'right',
    fontSize: '12px',
    color: '#999',
    marginTop: '6px'
  },
  emojiSection: {
    marginBottom: '24px'
  },
  emojiLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px'
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '8px'
  },
  emojiButton: {
    fontSize: '24px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  historySection: {
    marginTop: '30px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px'
  },
  historyTitle: {
    fontSize: '16px',
    color: 'white',
    marginBottom: '16px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px'
  },
  historyNickname: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600'
  },
  historyContent: {
    color: 'white',
    marginLeft: '6px'
  },
  errorPage: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '40px'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '12px'
  },
  errorText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px'
  },
  backButton: {
    padding: '14px 40px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
}

export default UserPage
