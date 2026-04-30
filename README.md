# 你说 - 现场弹幕系统

一个基于 React + Python + WebSocket + SQLite 的实时现场弹幕系统。

## 功能特性

- **主办方后台**: 创建弹幕房间，配置房间名、背景图、弹幕颜色等
- **二维码生成**: 自动生成用户端访问二维码
- **用户端**: 无需登录，扫码即可发送弹幕，支持设置昵称
- **大屏端**: 全屏实时显示弹幕墙，支持清屏、调节弹幕速度和字体大小
- **统计功能**: 统计弹幕总数，生成热门词云

## 技术栈

- **前端**: React 18 + React Router + Socket.IO Client + Vite
- **后端**: Python Flask + Flask-SocketIO
- **实时通信**: WebSocket
- **数据库**: SQLite
- **词云**: jieba 分词

## 项目结构

```
SayYou/
├── backend/                 # 后端服务
│   ├── app.py              # Flask 主应用 + WebSocket
│   ├── database.py         # SQLite 数据库操作
│   ├── requirements.txt    # Python 依赖
│   └── danmaku.db          # SQLite 数据库 (运行时自动创建)
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx    # 主办方后台
│   │   │   ├── UserPage.jsx     # 用户端
│   │   │   ├── ScreenPage.jsx   # 大屏端
│   │   │   └── StatsPage.jsx    # 统计页
│   │   ├── App.jsx         # 路由配置
│   │   ├── main.jsx        # 入口文件
│   │   └── index.css       # 全局样式
│   ├── index.html          # HTML 入口
│   ├── vite.config.js      # Vite 配置
│   └── package.json        # Node 依赖
├── start.bat               # 一键安装依赖脚本
├── start-backend.bat       # 启动后端服务
├── start-frontend.bat      # 启动前端服务
└── README.md               # 本文档
```

## 环境要求

- Python 3.8+
- Node.js 18+ (含 npm)

## 快速启动

### 方式一：使用启动脚本 (Windows)

1. **双击运行 `start.bat`** - 自动安装所有依赖

2. **启动后端服务**
   ```
   双击 start-backend.bat
   ```
   或手动运行：
   ```bash
   cd backend
   python app.py
   ```

3. **启动前端服务**
   ```
   双击 start-frontend.bat
   ```
   或手动运行：
   ```bash
   cd frontend
   npm run dev
   ```

### 方式二：手动安装

1. **安装后端依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **安装前端依赖**
   ```bash
   cd ../frontend
   npm install
   ```

3. **启动后端**
   ```bash
   cd ../backend
   python app.py
   ```
   后端服务将运行在 http://localhost:5000

4. **启动前端**
   ```bash
   cd ../frontend
   npm run dev
   ```
   前端服务将运行在 http://localhost:3000

## 使用指南

### 1. 主办方后台

访问 http://localhost:3000

- **创建房间**: 点击"创建新房间"按钮
- **配置房间**:
  - 输入房间名称
  - 可选：设置背景图片 URL
  - 选择弹幕颜色（多选）
- **房间列表**: 查看所有已创建的房间
- **二维码**: 每个房间卡片显示用户端二维码

### 2. 用户端

- **访问方式**: 扫描房间二维码 或 访问 `http://localhost:3000/user/{房间ID}`
- **功能**:
  - 输入昵称（可选，默认为"匿名用户"）
  - 输入弹幕内容（最多 100 字）
  - 快捷表情按钮
  - 查看发送历史

### 3. 大屏端

- **访问方式**: 从后台点击"大屏端"按钮 或 访问 `http://localhost:3000/screen/{房间ID}`
- **功能**:
  - 实时弹幕滚动显示
  - 控制面板（可隐藏）：
    - 调节弹幕速度（1-10）
    - 调节字体大小（20px-60px）
    - 清屏功能
    - 全屏模式

### 4. 统计页面

- **访问方式**: 从后台点击"统计"按钮 或 访问 `http://localhost:3000/stats/{房间ID}`
- **功能**:
  - 弹幕总数统计
  - 热门词云展示
  - 词汇出现次数排名
  - 自动刷新（每 5 秒）

## API 接口

### 房间管理

- `GET /api/rooms` - 获取所有房间列表
- `POST /api/rooms` - 创建新房间
- `GET /api/rooms/{roomId}` - 获取房间详情
- `GET /api/rooms/{roomId}/qrcode` - 获取房间二维码图片

### 弹幕管理

- `GET /api/rooms/{roomId}/danmakus` - 获取房间弹幕列表
- `POST /api/rooms/{roomId}/danmakus` - 发送弹幕
- `POST /api/rooms/{roomId}/clear` - 清空房间弹幕

### 统计

- `GET /api/rooms/{roomId}/stats` - 获取房间统计数据

## WebSocket 事件

### 客户端发送

- `join` - 加入房间
  ```json
  { "room_id": "房间ID" }
  ```

- `leave` - 离开房间
  ```json
  { "room_id": "房间ID" }
  ```

### 服务端推送

- `new_danmaku` - 新弹幕
  ```json
  {
    "content": "弹幕内容",
    "nickname": "用户昵称",
    "color": "#FF6B6B",
    "room_id": "房间ID"
  }
  ```

- `clear_screen` - 清屏通知
- `joined` - 加入成功
- `left` - 离开成功

## 验证步骤

1. **启动验证**
   - 后端启动后访问 http://localhost:5000/api/rooms 应返回空数组
   - 前端启动后访问 http://localhost:3000 应显示后台页面

2. **功能验证**
   1. 在后台创建一个房间
   2. 打开大屏端页面（新窗口）
   3. 打开用户端页面（新窗口或手机扫码）
   4. 在用户端发送弹幕
   5. 观察大屏端是否实时显示弹幕
   6. 检查统计页是否正确计数

3. **WebSocket 验证**
   - 检查浏览器控制台 WebSocket 连接状态
   - 验证多用户同时发送是否正常

## 注意事项

1. **局域网访问**: 如果需要其他设备访问，请使用本机 IP 地址，如 `http://192.168.1.100:3000`

2. **背景图片**: 背景图片 URL 需要是可访问的网络地址

3. **数据库**: SQLite 数据库文件 `danmaku.db` 会在首次启动后端时自动创建

4. **端口冲突**: 如果 5000 或 3000 端口被占用，请修改配置

## 故障排查

### 后端启动失败

- 检查 Python 版本：`python --version`
- 检查依赖是否安装：`pip list`
- 检查端口是否被占用

### 前端启动失败

- 检查 Node.js 版本：`node --version`
- 检查 npm 依赖：删除 `node_modules` 和 `package-lock.json`，重新 `npm install`

### WebSocket 连接失败

- 检查后端是否正常启动
- 检查浏览器控制台错误信息
- 确保没有防火墙或代理阻止 WebSocket 连接

## 许可证

MIT License
