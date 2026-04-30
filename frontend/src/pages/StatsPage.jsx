import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE = ''

function StatsPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [roomId])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('获取统计数据失败')
      }
    } catch (error) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const generateWordCloud = () => {
    if (!stats || !stats.word_cloud || stats.word_cloud.length === 0) {
      return null
    }

    const words = stats.word_cloud
    const maxValue = Math.max(...words.map(w => w.value))
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D'
    ]

    return (
      <div style={styles.wordCloudContainer}>
        {words.map((word, index) => {
          const fontSize = Math.max(16, (word.value / maxValue) * 48)
          const opacity = Math.max(0.4, word.value / maxValue)
          const color = colors[index % colors.length]
          const rotation = (Math.random() - 0.5) * 30

          return (
            <span
              key={index}
              style={{
                ...styles.wordTag,
                fontSize: `${fontSize}px`,
                color: color,
                opacity: opacity,
                transform: `rotate(${rotation}deg)`,
                margin: '4px 8px'
              }}
            >
              {word.text}
            </span>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>⏳</div>
        <p style={styles.loadingText}>加载统计数据中...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorIcon}>❌</div>
        <h2 style={styles.errorTitle}>加载失败</h2>
        <p style={styles.errorText}>{error || '无法获取统计数据'}</p>
        <button
          onClick={() => navigate('/admin')}
          style={styles.backButton}
        >
          返回管理后台
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📊 弹幕统计</h1>
          <p style={styles.subtitle}>{stats.room_name}</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          style={styles.backButton}
        >
          ← 返回后台
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💬</div>
            <div style={styles.statValue}>{stats.total_danmakus}</div>
            <div style={styles.statLabel}>弹幕总数</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏷️</div>
            <div style={styles.statValue}>{stats.word_cloud?.length || 0}</div>
            <div style={styles.statLabel}>关键词数量</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔥</div>
            <div style={styles.statValue}>
              {stats.word_cloud?.[0]?.text || '-'}
            </div>
            <div style={styles.statLabel}>最热词</div>
          </div>
        </div>

        <div style={styles.wordCloudSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>☁️ 热门词云</h2>
            <button
              onClick={fetchStats}
              style={styles.refreshButton}
            >
              🔄 刷新
            </button>
          </div>

          {stats.word_cloud && stats.word_cloud.length > 0 ? (
            <div>
              {generateWordCloud()}

              <div style={styles.wordListSection}>
                <h3 style={styles.wordListTitle}>热门词汇排名</h3>
                <div style={styles.wordList}>
                  {stats.word_cloud.slice(0, 15).map((word, index) => (
                    <div key={index} style={styles.wordListItem}>
                      <span style={{
                        ...styles.rankBadge,
                        backgroundColor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#666'
                      }}>
                        {index + 1}
                      </span>
                      <span style={styles.wordText}>{word.text}</span>
                      <span style={styles.wordCount}>出现 {word.value} 次</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyWordCloud}>
              <div style={styles.emptyIcon}>📝</div>
              <p style={styles.emptyText}>暂无词云数据</p>
              <p style={styles.emptySubtext}>发送更多弹幕来生成词云</p>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerContent: {
    textAlign: 'left'
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
  },
  statIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  statValue: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666'
  },
  wordCloudSection: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '22px',
    color: '#333',
    margin: 0
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  wordCloudContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    minHeight: '200px'
  },
  wordTag: {
    fontWeight: 'bold',
    cursor: 'default',
    transition: 'transform 0.2s, scale 0.2s',
    display: 'inline-block'
  },
  wordListSection: {
    marginTop: '30px'
  },
  wordListTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '16px',
    paddingLeft: '8px',
    borderLeft: '4px solid #667eea'
  },
  wordList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  wordListItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    gap: '12px'
  },
  rankBadge: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  wordText: {
    flex: 1,
    fontWeight: '600',
    color: '#333'
  },
  wordCount: {
    fontSize: '12px',
    color: '#999'
  },
  emptyWordCloud: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999'
  },
  loadingPage: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666'
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
    padding: '12px 30px',
    fontSize: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default StatsPage
