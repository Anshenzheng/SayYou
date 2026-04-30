@echo off
echo ============================================
echo    你说 - 现场弹幕系统
echo    启动脚本 (Windows)
echo ============================================
echo.

echo [1/4] 检查 Python 和 pip...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)
echo [OK] Python 已安装

echo.
echo [2/4] 安装后端依赖...
cd backend
pip install -r requirements.txt -q
echo [OK] 后端依赖安装完成

echo.
echo [3/4] 检查 Node.js 和 npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo.
echo [4/4] 安装前端依赖...
cd ..\frontend
call npm install
echo [OK] 前端依赖安装完成

echo.
echo ============================================
echo    安装完成！
echo ============================================
echo.
echo 启动步骤：
echo.
echo 1. 打开一个新的终端窗口，运行后端：
echo    cd backend
echo    python app.py
echo.
echo 2. 打开另一个终端窗口，运行前端：
echo    cd frontend
echo    npm run dev
echo.
echo 3. 访问 http://localhost:3000 开始使用
echo.
echo ============================================
pause
