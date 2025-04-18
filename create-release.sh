#!/bin/bash

# Создаем временную директорию
mkdir -p dist

# Копируем файлы расширения
cp manifest.json dist/
cp popup.html dist/
cp popup.js dist/
cp utils.js dist/
cp background.js dist/
cp README.md dist/

# Создаем ZIP-архив
cd dist
zip -r ../dms-localstorage-injector.zip *
cd ..

# Удаляем временную директорию
rm -rf dist

echo "Архив создан: dms-localstorage-injector.zip" 