@echo off

REM Создаем временную директорию
mkdir dist 2>nul

REM Копируем файлы расширения
copy manifest.json dist\
copy popup.html dist\
copy popup.js dist\
copy utils.js dist\
copy background.js dist\
copy README.md dist\

REM Создаем ZIP-архив
powershell Compress-Archive -Path dist\* -DestinationPath dms-localstorage-injector.zip -Force

REM Удаляем временную директорию
rmdir /s /q dist

echo Архив создан: dms-localstorage-injector.zip 