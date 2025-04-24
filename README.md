# DMS LocalStorage Injector

Расширение для Chrome, позволяющее управлять override'ами модулей в DMS.

## Возможности

- Автоматическое определение окружения
- Управление override'ами для модулей:
  - @dar-dms/chat
  - @dar-dms/bot
  - @dar-dms/automations
  - @dar-dms/comms
  - @dar-dms/moms
  - @dar-dms/home
  - @dar-dms/topbar
- Управление DevTools
- Простой и интуитивный интерфейс

## Установка и настройка

1. Скачайте последнюю версию расширения из [релизов](https://github.com/Baradusha/dms-localstorage-injector/releases)
2. Откройте Chrome и перейдите по адресу: `chrome://extensions/`
3. Включите "Режим разработчика" (Developer mode)
4. Перетащите скачанный ZIP-файл в окно расширений
5. В настройках расширения включите:
   - ✅ Закрепить на панели инструментов
   - ✅ Разрешить использование в режиме инкогнито

## Обновление

1. Скачайте новую версию из [релизов](https://github.com/Baradusha/dms-localstorage-injector/releases)
2. Перетащите скачанный ZIP-файл в окно расширений поверх старой версии
3. Подтвердите обновление

## Использование

1. Откройте расширение на поддерживаемой странице DMS
2. Расширение автоматически определит текущее окружение
3. Выберите нужные модули
4. Включите/выключите DevTools при необходимости
5. Нажмите "Применить изменения"

## Поддерживаемые окружения

- dms.dar-dev.zone
- dms.dar-qa.zone
- stage-dms.dar-qa.zone
- dms.dar.io
- app.darlean.kz
- app.darlean.eu
- app.darlean.com
