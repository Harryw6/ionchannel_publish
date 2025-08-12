@echo off
echo 正在启动本地服务器...
echo.
echo 服务器将在以下地址启动:
echo - http://localhost:8000
echo - http://127.0.0.1:8000
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 检查Python是否可用
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Python启动服务器...
    python -m http.server 8000
) else (
    echo Python未安装，尝试使用Node.js...
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo 使用Node.js启动服务器...
        npx http-server -p 8000
    ) else (
        echo 错误：未找到Python或Node.js
        echo 请安装其中一种来运行本地服务器
        pause
        exit /b 1
    )
)

pause