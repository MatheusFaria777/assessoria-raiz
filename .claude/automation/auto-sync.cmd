@echo off
set REPO=C:\NOVAOR~1\CLAUDE~1\CCOS-R~1
set LOG=%REPO%\.claude\automation\auto-sync.log
cd /d "%REPO%"
echo [%date% %time%] Iniciando auto-sync >> "%LOG%"
git pull --rebase --autostash >> "%LOG%" 2>&1
git add -A >> "%LOG%" 2>&1
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "auto-sync: %date% %time%" >> "%LOG%" 2>&1
    git push >> "%LOG%" 2>&1
    echo [%date% %time%] Mudancas sincronizadas >> "%LOG%"
) else (
    echo [%date% %time%] Nada pra sincronizar >> "%LOG%"
)
