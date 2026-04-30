from flask import Flask, request, jsonify, send_file, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import io
import qrcode
import uuid
import random
import jieba
import os
from collections import Counter
from database import (
    init_db, create_room, get_room, get_all_rooms,
    add_danmaku, get_danmakus, get_danmaku_count,
    get_all_danmaku_content, clear_danmakus
)

app = Flask(__name__, 
            static_folder='../frontend/dist', 
            static_url_path='')
app.config['SECRET_KEY'] = 'sayyou-danmaku-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

FRONTEND_DEV_PORT = 3000
BACKEND_PORT = 5000

def get_frontend_url(path=''):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return None
    
    host_url = request.host_url.rstrip('/')
    frontend_url = host_url.replace(f':{BACKEND_PORT}', f':{FRONTEND_DEV_PORT}')
    
    env_url = os.environ.get('FRONTEND_URL')
    if env_url:
        frontend_url = env_url.rstrip('/')
    
    return frontend_url + path if path else frontend_url

init_db()

@app.route('/')
def index():
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_file(os.path.join(dist_path, 'index.html'))
    return redirect(get_frontend_url())

@app.route('/admin')
def admin_redirect():
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_file(os.path.join(dist_path, 'index.html'))
    return redirect(get_frontend_url('/admin'))

@app.route('/user/<room_id>')
def user_redirect(room_id):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_file(os.path.join(dist_path, 'index.html'))
    return redirect(get_frontend_url(f'/user/{room_id}'))

@app.route('/screen/<room_id>')
def screen_redirect(room_id):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_file(os.path.join(dist_path, 'index.html'))
    return redirect(get_frontend_url(f'/screen/{room_id}'))

@app.route('/stats/<room_id>')
def stats_redirect(room_id):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend/dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_file(os.path.join(dist_path, 'index.html'))
    return redirect(get_frontend_url(f'/stats/{room_id}'))

@app.route('/api/rooms', methods=['GET'])
def list_rooms():
    rooms = get_all_rooms()
    return jsonify(rooms)

@app.route('/api/rooms', methods=['POST'])
def create_room_api():
    data = request.json
    room_id = str(uuid.uuid4())[:8]
    name = data.get('name', '弹幕房间')
    background = data.get('background')
    colors = data.get('colors')
    
    create_room(room_id, name, background, colors)
    room = get_room(room_id)
    
    return jsonify(room), 201

@app.route('/api/rooms/<room_id>', methods=['GET'])
def get_room_api(room_id):
    room = get_room(room_id)
    if room:
        return jsonify(room)
    return jsonify({'error': '房间不存在'}), 404

@app.route('/api/rooms/<room_id>/qrcode', methods=['GET'])
def get_room_qrcode(room_id):
    room = get_room(room_id)
    if not room:
        return jsonify({'error': '房间不存在'}), 404
    
    base_url = request.host_url.rstrip('/')
    user_url = f"{base_url}/user/{room_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(user_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color='black', back_color='white')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    
    return send_file(buf, mimetype='image/png')

@app.route('/api/rooms/<room_id>/danmakus', methods=['GET'])
def get_room_danmakus(room_id):
    room = get_room(room_id)
    if not room:
        return jsonify({'error': '房间不存在'}), 404
    
    limit = request.args.get('limit', 100, type=int)
    danmakus = get_danmakus(room_id, limit)
    return jsonify(danmakus)

@app.route('/api/rooms/<room_id>/danmakus', methods=['POST'])
def send_danmaku_api(room_id):
    room = get_room(room_id)
    if not room:
        return jsonify({'error': '房间不存在'}), 404
    
    data = request.json
    content = data.get('content', '').strip()
    nickname = data.get('nickname', '匿名用户').strip() or '匿名用户'
    
    if not content:
        return jsonify({'error': '弹幕内容不能为空'}), 400
    
    colors = room.get('colors', ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF9FF3', '#54A0FF', '#5F27CD'])
    color = random.choice(colors)
    
    add_danmaku(room_id, content, nickname, color)
    
    danmaku_data = {
        'content': content,
        'nickname': nickname,
        'color': color,
        'room_id': room_id
    }
    
    socketio.emit('new_danmaku', danmaku_data, room=room_id)
    
    return jsonify({'status': 'success', 'danmaku': danmaku_data})

@app.route('/api/rooms/<room_id>/clear', methods=['POST'])
def clear_room_danmakus(room_id):
    room = get_room(room_id)
    if not room:
        return jsonify({'error': '房间不存在'}), 404
    
    clear_danmakus(room_id)
    socketio.emit('clear_screen', room=room_id)
    
    return jsonify({'status': 'success'})

@app.route('/api/rooms/<room_id>/stats', methods=['GET'])
def get_room_stats(room_id):
    room = get_room(room_id)
    if not room:
        return jsonify({'error': '房间不存在'}), 404
    
    count = get_danmaku_count(room_id)
    contents = get_all_danmaku_content(room_id)
    
    word_freq = {}
    for content in contents:
        words = jieba.cut(content)
        for word in words:
            if len(word) >= 2:
                word_freq[word] = word_freq.get(word, 0) + 1
    
    word_cloud = []
    for word, freq in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:50]:
        word_cloud.append({'text': word, 'value': freq})
    
    return jsonify({
        'room_id': room_id,
        'room_name': room['name'],
        'total_danmakus': count,
        'word_cloud': word_cloud
    })

@socketio.on('join')
def on_join(data):
    room_id = data.get('room_id')
    join_room(room_id)
    emit('joined', {'room_id': room_id, 'message': '已加入房间'})

@socketio.on('leave')
def on_leave(data):
    room_id = data.get('room_id')
    leave_room(room_id)
    emit('left', {'room_id': room_id, 'message': '已离开房间'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
