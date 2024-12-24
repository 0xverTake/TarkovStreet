@echo off
echo Mise à jour du cache Tarkov Market...
cd /d "%~dp0"
"C:\xampp\php\php.exe" update_cache_cron.php
echo.
if errorlevel 1 (
    echo Erreur lors de la mise à jour. Vérifiez le fichier de log.
    pause
) else (
    echo Mise à jour terminée avec succès !
    timeout /t 5
)
