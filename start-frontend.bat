@echo off
echo ============================================
echo    你说 - 现场弹幕系统
echo    启动前端服务
echo ============================================
echo.

cd /d "%~dp0frontend"

echo 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo [错误] 请先安装 Node.js 18+
    pause
    exit /b 1
)

echo.
echo 启动前端开发服务器...
echo 访问地址: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo ============================================
echo.

npm run dev
