@echo off
set PYTHON=C:\Users\mathe\AppData\Local\Programs\Python\Python314\python.exe
set DIR=%~dp0

echo Encerrando sessoes anteriores...

:: Encerra backend (porta 8001)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001 "') do (
    taskkill /F /PID %%a > nul 2>&1
)

:: Encerra frontend Vite (porta 5173)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    taskkill /F /PID %%a > nul 2>&1
)

:: Aguarda portas liberarem
timeout /t 2 > nul

echo Iniciando Sistema Raiz...

:: Inicia backend
start "Sistema Raiz - Backend" /D "%DIR%backend" "%PYTHON%" main.py

:: Aguarda backend subir
timeout /t 3 > nul

:: Inicia frontend
start "Sistema Raiz - Frontend" /D "%DIR%frontend" cmd /c "npm run dev"

:: Aguarda frontend subir
timeout /t 4 > nul

:: Abre no navegador (sempre abre aba nova limpa)
start "" "http://localhost:5173"

echo.
echo Sistema Raiz iniciado com sessao limpa!
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:5173
echo.
