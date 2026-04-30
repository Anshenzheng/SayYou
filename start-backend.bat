@echo off
echo ============================================
echo    你说 - 现场弹幕系统
echo    启动后端服务
echo ============================================
echo.

cd /d "%~dp0backend"

echo 检查 Python 环境...
python --version
if errorlevel 1 (
    echo [错误] 请先安装 Python 3.8+
    pause
    exit /b 1
)

echo.
echo 启动后端服务...
echo 服务地址: http://localhost:5000
echo WebSocket: ws://localhost:5000
echo.
echo 按 Ctrl+C 停止服务
echo ============================================
echo.

python app.py
