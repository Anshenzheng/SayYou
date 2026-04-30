import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = ''

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#FF9FF3', '#54A0FF', '#5F27CD'
]

function AdminPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    background: '',
    colors: defaultColors.join(',')
  })
  const [selectedColors, setSelectedColors] = useState(defaultColors)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms`)
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('获取房间列表失败:', error)
    }
  }

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color)
      }
      return [...prev, color]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || '弹幕房间',
          background: formData.background || null,
          colors: selectedColors
        })
      })

      if (response.ok) {
        setFormData({ name: '', background: '', colors: defaultColors.join(',') })
        setSelectedColors(defaultColors)
        setShowCreateForm(false)
        fetchRooms()
      }
    } catch (error) {
      console.error('创建房间失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQrCodeUrl = (roomId) => {
    return `${API_BASE}/api/rooms/${roomId}/qrcode?${Date.now()}`
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎤 你说 - 现场弹幕系统</h1>
        <p style={styles.subtitle}>主办方后台管理</p>
      </header>

      <div style={styles.content}>
        <div style={styles.actionBar}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={styles.primaryButton}
          >
            {showCreateForm ? '✕ 取消' : '➕ 创建新房间'}
          </button>
        </div>

        {showCreateForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>创建弹幕房间</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>房间名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入房间名称"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>背景图片 URL（可选）</label>
                <input
                  type="url"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="https://example.com/background.jpg"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>弹幕颜色（多选）</label>
                <div style={styles.colorGrid}>
                  {defaultColors.map((color) => (
                    <div
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      style={{
                        ...styles.colorOption,
                        backgroundColor: color,
                        border: selectedColors.includes(color) ? '3px solid #333' : '3px solid transparent',
                        opacity: selectedColors.includes(color) ? 1 : 0.3
                      }}
                    >
                      {selectedColors.includes(color) && <span style={styles.checkmark}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  disabled={loading || selectedColors.length === 0}
                  style={{
                    ...styles.submitButton,
                    opacity: (loading || selectedColors.length === 0) ? 0.6 : 1,
                    cursor: (loading || selectedColors.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '创建中...' : '创建房间'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.roomsSection}>
          <h3 style={styles.sectionTitle}>📋 房间列表</h3>
          {rooms.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>暂无房间，点击上方按钮创建一个</p>
            </div>
          ) : (
            <div style={styles.roomsGrid}>
              {rooms.map((room) => (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomHeader}>
                    <h4 style={styles.roomName}>{room.name}</h4>
                    <span style={styles.roomId}>ID: {room.id}</span>
                  </div>

                  <div style={styles.qrSection}>
                    <img
                      src={getQrCodeUrl(room.id)}
                      alt="房间二维码"
                      style={styles.qrCode}
                    />
                    <p style={styles.qrHint}>手机扫码发送弹幕</p>
                  </div>

                  <div style={styles.roomActions}>
                    <button
                      onClick={() => navigate(`/screen/${room.id}`)}
                      style={styles.actionButton}
                    >
                      📺 大屏端
                    </button>
                    <button
                      onClick={() => navigate(`/user/${room.id}`)}
                      style={{ ...styles.actionButton, backgroundColor: '#4CAF50' }}
                    >
                      📱 用户端
                    </button>
                    <button
                      onClick={() => navigate(`/stats/${room.id}`)}
                      style={{ ...styles.actionButton, backgroundColor: '#9C27B0' }}
                    >
                      📊 统计
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100%',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  header: {
    textAlign: 'center',
    padding: '20px 0',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginTop: '8px'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  primaryButton: {
    padding: '16px 32px',
    fontSize: '18px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    transition: 'all 0.3s ease'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  formTitle: {
    fontSize: '20px',
    marginBottom: '25px',
    color: '#333'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '10px'
  },
  colorOption: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  checkmark: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '30px'
  },
  submitButton: {
    padding: '14px 40px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  roomsSection: {
    marginTop: '40px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px'
  },
  emptyText: {
    color: '#999',
    fontSize: '16px'
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  roomHeader: {
    marginBottom: '15px'
  },
  roomName: {
    fontSize: '18px',
    color: '#333',
    margin: 0
  },
  roomId: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px'
  },
  qrSection: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  qrCode: {
    width: '150px',
    height: '150px',
    borderRadius: '8px'
  },
  qrHint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px'
  },
  roomActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  actionButton: {
    padding: '10px 8px',
    fontSize: '12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default AdminPage
