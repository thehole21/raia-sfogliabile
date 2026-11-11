@echo off
title Push to GitHub - Raia Sfogliabile
cd /d "%~dp0"
echo ======================================================
echo    INVIO CODICE SU GITHUB (thehole21/raia-sfogliabile)
echo ======================================================
echo.
echo Assicurati di aver creato la repository vuota su GitHub:
echo https://github.com/new (nome: raia-sfogliabile)
echo.
git push -u origin main
echo.
pause
