import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

const API_BASE = ''

function ScreenPage() {
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [danmakus, setDanmakus] = useState([])
  const [settings, setSettings] = useState({
    speed: 5,
    fontSize: 32,
    showControls: true
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const socketRef = useRef(null)
  const animationRefs = useRef({})
  const danmakuIdCounter = useRef(0)

  useEffect(() => {
    fetchRoomInfo()
    fetchInitialDanmakus()
    setupWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [roomId])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      }
    } catch (error) {
      console.error('获取房间信息失败:', error)
    }
  }

  const fetchInitialDanmakus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}/danmakus?limit=50`)
      if (response.ok) {
        const data = await response.json()
        const newDanmakus = data.slice().reverse().map(d => ({
          ...d,
          localId: ++danmakuIdCounter.current,
          track: Math.floor(Math.random() * 8),
          startTime: Date.now()
        }))
        setDanmakus(newDanmakus)
      }
    } catch (error) {
      console.error('获取历史弹幕失败:', error)
    }
  }

  const setupWebSocket = () => {
    const socket = io({ transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join', { room_id: roomId })
    })

    socket.on('new_danmaku', (data) => {
      addDanmaku(data)
    })

    socket.on('clear_screen', () => {
      handleClearScreen()
    })
  }

  const addDanmaku = useCallback((danmaku) => {
    const newDanmaku = {
      ...danmaku,
      localId: ++danmakuIdCounter.current,
      track: Math.floor(Math.random() * 8),
      startTime: Date.now()
    }
    setDanmakus(prev => [...prev, newDanmaku])

    setTimeout(() => {
      setDanmakus(prev => prev.filter(d => d.localId !== newDanmaku.localId))
    }, 15000)
  }, [])

  const handleClearScreen = () => {
    setDanmakus([])
  }

  const handleClearScreenClick = async () => {
    try {
      await fetch(`${API_BASE}/api/rooms/${roomId}/clear`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('清屏失败:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const toggleControls = () => {
    setSettings(prev => ({
      ...prev,
      showControls: !prev.showControls
    }))
  }

  const getDanmakuStyle = (danmaku) => {
    const containerWidth = window.innerWidth
    const textLength = danmaku.content.length * settings.fontSize
    const duration = 8 + (settings.speed > 5 ? (10 - settings.speed) : (5 - settings.speed))
    
    const availableTracks = 8
    const trackHeight = settings.fontSize + 20
    const topPosition = danmaku.track * trackHeight + 20

    return {
      position: 'absolute',
      whiteSpace: 'nowrap',
      fontSize: `${settings.fontSize}px`,
      color: danmaku.color || '#FFFFFF',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      fontWeight: 'bold',
      top: `${topPosition}px`,
      left: `${containerWidth}px`,
      animation: `danmakuMove ${duration}s linear forwards`,
      zIndex: 10,
      pointerEvents: 'none'
    }
  }

  const backgroundStyle = room?.background ? {
    backgroundImage: `url(${room.background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes danmakuMove {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-100% - 100vw));
            }
          }
          
          .danmaku-item {
            animation: danmakuMove var(--duration, 8s) linear forwards;
          }
        `}
      </style>

      <div style={{ ...styles.screen, ...backgroundStyle }} ref={containerRef}>
        {danmakus.map((danmaku) => (
          <div
            key={danmaku.localId}
            style={getDanmakuStyle(danmaku)}
          >
            {danmaku.content}
          </div>
        ))}

        {danmakus.length === 0 && (
          <div style={styles.emptyHint}>
            <div style={styles.emptyIcon}>📺</div>
            <p style={styles.emptyText}>等待弹幕发送中...</p>
            <p style={styles.emptySubtext}>用户扫码即可发送弹幕</p>
          </div>
        )}
      </div>

      {settings.showControls && (
        <div style={styles.controlPanel}>
          <div style={styles.controlHeader}>
            <span style={styles.controlTitle}>🎮 控制面板</span>
            <button onClick={toggleControls} style={styles.closeButton}>
              ✕
            </button>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.controlLabel}>弹幕速度</label>
            <div style={styles.sliderContainer}>
              <span style={styles.sliderValue}>{settings.speed}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.speed}
                onChange={(e) => setSettings(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                style={styles.slider}
              />
              <span style={styles.sliderLabel}>慢 → 快</span>
            </div>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.controlLabel}>字体大小</label>
            <div style={styles.sliderContainer}>
              <span style={styles.sliderValue}>{settings.fontSize}px</span>
              <input
                type="range"
                min="20"
                max="60"
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                style={styles.slider}
              />
            </div>
          </div>

          <div style={styles.controlActions}>
            <button
              onClick={handleClearScreenClick}
              style={{ ...styles.actionBtn, backgroundColor: '#f44336' }}
            >
              🗑️ 清屏
            </button>
            <button
              onClick={toggleFullscreen}
              style={{ ...styles.actionBtn, backgroundColor: '#2196F3' }}
            >
              {isFullscreen ? '📱 退出全屏' : '⛶ 全屏'}
            </button>
          </div>
        </div>
      )}

      {!settings.showControls && (
        <button
          onClick={toggleControls}
          style={styles.toggleButton}
        >
          ⚙️ 设置
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  screen: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  emptyHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyText: {
    fontSize: '24px',
    marginBottom: '10px'
  },
  emptySubtext: {
    fontSize: '16px',
    opacity: 0.7
  },
  controlPanel: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: '16px',
    padding: '20px',
    zIndex: 100,
    minWidth: '400px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  controlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  controlTitle: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  closeButton: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  controlGroup: {
    marginBottom: '16px'
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sliderValue: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    minWidth: '50px'
  },
  slider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    outline: 'none',
    WebkitAppearance: 'none'
  },
  sliderLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px'
  },
  controlActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  actionBtn: {
    flex: 1,
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  toggleButton: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    cursor: 'pointer',
    zIndex: 100
  }
}

export default ScreenPage
