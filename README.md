
<img width="512" height="512" alt="icon" src="https://github.com/user-attachments/assets/0d4338a1-f5e2-4e8c-a3fe-e393df68686d" />







# ✨ KawaiiCut

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-important.svg)

[English](#english) | [Русский](#russian)

<a name="english"></a>

**KawaiiCut** is a modern, anime-styled video editing application built with web technologies. It combines a sleek, dark-themed aesthetic with powerful editing capabilities, featuring a timeline, media management, text overlays, visual effects, and AI assistance.

![Screenshot](https://via.placeholder.com/800x450.png?text=KawaiiCut+Screenshot)

## 🌟 Features

*   **Multi-Track Timeline:** Drag-and-drop support for video, audio, and overlay tracks.
*   **Media Library:** Import and manage your videos, images, and audio files.
*   **Rich Text Editor:** Add stylish text with preset animations (Cyber, Retro, Neon, etc.) and custom fonts.
*   **Visual Effects:** Apply effects like VHS Glitch, Snow, Rain, Blur, and more via drag-and-drop.
*   **Keyframe-like Control:** Adjust scale, position, rotation, and opacity for every clip.
*   **AI Assistant:** Built-in "Sakura" assistant (powered by Gemini) to help with editing tips.
*   **Export:** Render your projects to MP4 with customizable resolution (up to 4K) and FPS.
*   **Auto-Save:** Projects are automatically saved to the local database.

## 🛠 Tech Stack

*   **Core:** [Electron](https://www.electronjs.org/)
*   **UI Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb`)
*   **AI:** Google Gemini API

## 🚀 Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/dvytvs/KawaiiCut.git
    cd KawaiiCut
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Setup API Key (Optional for AI features):**
    Create a `.env` file or set the environment variable `API_KEY` with your Google Gemini API key to enable the AI assistant.

### Running in Development

To start the app in development mode with hot-reloading:

```bash
npm start
```

## 📦 Building for Production

To build the application for your OS (Linux, Windows, or macOS):

```bash
npm run build
```

The output files (AppImage, deb, snap, etc.) will be located in the `release/` directory.

## ⌨️ Controls

*   **Space:** Play / Pause
*   **Delete / Backspace:** Delete selected clip
*   **Drag & Drop:** Move clips, import media, apply effects
*   **Mouse Wheel:** Scroll timeline

---

<a name="russian"></a>

# 🇷🇺 KawaiiCut (Описание на русском)

**KawaiiCut** — это современное приложение для видеомонтажа в аниме-стиле, созданное с использованием веб-технологий. Оно сочетает в себе эстетичный темный интерфейс с мощными возможностями редактирования, включая мультитрековый таймлайн, управление медиафайлами, стильные титры, визуальные эффекты и AI-ассистента.

## 🌟 Возможности

*   **Мультитрековый таймлайн:** Поддержка перетаскивания (drag-and-drop) для видео, аудио и оверлеев.
*   **Медиатека:** Импорт и управление вашими видео, изображениями и аудиофайлами.
*   **Редактор текста:** Добавление стильного текста с пресетами (Кибер, Ретро, Неон и др.) и кастомными шрифтами.
*   **Визуальные эффекты:** Применение эффектов, таких как VHS-глитч, Снег, Дождь, Размытие и других, простым перетаскиванием.
*   **Настройка клипов:** Регулировка масштаба, позиции, поворота, прозрачности и скорости воспроизведения.
*   **AI Ассистент:** Встроенная помощница "Сакура" (на базе Gemini), которая поможет советами по монтажу.
*   **Экспорт:** Рендеринг проектов в MP4 с настраиваемым разрешением (до 4K) и FPS (30/60).
*   **Автосохранение:** Проекты автоматически сохраняются в локальную базу данных браузера (IndexedDB).

## 🛠 Стек технологий

*   **Ядро:** Electron
*   **Интерфейс:** React
*   **Сборщик:** Vite
*   **Язык:** TypeScript
*   **Стили:** Tailwind CSS
*   **База данных:** IndexedDB (через `idb`)
*   **ИИ:** Google Gemini API

## 🚀 Начало работы

### Требования

*   Node.js (версия 16 или выше)
*   npm

### Установка

1.  Клонируйте репозиторий:
    ```bash
    git clone https://github.com/dvytvs/KawaiiCut.git
    cd KawaiiCut
    ```

2.  Установите зависимости:
    ```bash
    npm install
    ```

3.  **Настройка API ключа (Опционально для AI):**
    Создайте файл `.env` в корне проекта и добавьте переменную `API_KEY` с вашим ключом Google Gemini API, чтобы включить ассистента.

### Запуск (Режим разработки)

Чтобы запустить приложение в режиме разработки с hot-reloading:

```bash
npm start
```

## 📦 Сборка (Build)

Чтобы собрать приложение в установочный файл для вашей ОС (Linux, Windows или macOS):

```bash
npm run build
```

Готовые файлы (AppImage, deb, snap и т.д.) появятся в папке `release/`.

> **Примечание для Linux:** Для сборки `.deb` пакетов в `package.json` обязательно должно быть указано поле `homepage`.

## ⌨️ Управление

*   **Пробел:** Воспроизведение / Пауза
*   **Delete / Backspace:** Удалить выбранный клип
*   **Drag & Drop:** Перемещение клипов, импорт медиа, применение эффектов
*   **Колесо мыши:** Прокрутка таймлайна

---

## 👤 Author / Автор

**dvytvs**
*   Email: zapretsystem445@proton.me

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
