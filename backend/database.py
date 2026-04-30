import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'danmaku.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            background TEXT,
            colors TEXT DEFAULT '["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#FF9FF3","#54A0FF","#5F27CD"]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS danmakus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id TEXT NOT NULL,
            content TEXT NOT NULL,
            nickname TEXT DEFAULT '匿名用户',
            color TEXT DEFAULT '#FFFFFF',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_room(room_id, name, background=None, colors=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    default_colors = '["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#FF9FF3","#54A0FF","#5F27CD"]'
    colors_str = json.dumps(colors) if colors else default_colors
    
    cursor.execute('''
        INSERT INTO rooms (id, name, background, colors)
        VALUES (?, ?, ?, ?)
    ''', (room_id, name, background, colors_str))
    
    conn.commit()
    conn.close()

def get_room(room_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rooms WHERE id = ?', (room_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'name': row[1],
            'background': row[2],
            'colors': json.loads(row[3]) if row[3] else [],
            'created_at': row[4],
            'is_active': row[5]
        }
    return None

def get_all_rooms():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rooms ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    rooms = []
    for row in rows:
        rooms.append({
            'id': row[0],
            'name': row[1],
            'background': row[2],
            'colors': json.loads(row[3]) if row[3] else [],
            'created_at': row[4],
            'is_active': row[5]
        })
    return rooms

def add_danmaku(room_id, content, nickname='匿名用户', color=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO danmakus (room_id, content, nickname, color, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (room_id, content, nickname, color, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

def get_danmakus(room_id, limit=100):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, room_id, content, nickname, color, created_at
        FROM danmakus
        WHERE room_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ''', (room_id, limit))
    
    rows = cursor.fetchall()
    conn.close()
    
    danmakus = []
    for row in rows:
        danmakus.append({
            'id': row[0],
            'room_id': row[1],
            'content': row[2],
            'nickname': row[3],
            'color': row[4],
            'created_at': row[5]
        })
    return danmakus

def get_danmaku_count(room_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM danmakus WHERE room_id = ?', (room_id,))
    count = cursor.fetchone()[0]
    conn.close()
    return count

def get_all_danmaku_content(room_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT content FROM danmakus WHERE room_id = ?', (room_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [row[0] for row in rows]

def clear_danmakus(room_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM danmakus WHERE room_id = ?', (room_id,))
    conn.commit()
    conn.close()
