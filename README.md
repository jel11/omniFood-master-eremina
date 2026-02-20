# 📋 УП 09.02 — Оптимизация производительности сайта Omnifood

**Учебная практика:** УП 09.02
**Проект:** Omnifood — сайт подписки на здоровое питание с ИИ
**Тема:** Оптимизация производительности веб-приложения

---

## 📁 Структура проекта

```
omniFood-master-eremina/
├── OmniFood/                        # Основной проект
│   ├── index.html                   # Главная страница (оптимизирована)
│   ├── sw.js                        # Service Worker (PWA + офлайн)
│   ├── manifest.webmanifest         # PWA манифест
│   ├── .htaccess                    # HTTP кэширование (Apache)
│   ├── package.json                 # Скрипты автоматизации
│   ├── budget.json                  # Performance Budget
│   ├── css/
│   │   ├── general.css              # Базовые стили
│   │   ├── style.css                # Основные стили
│   │   └── queries.css              # Медиазапросы
│   ├── js/
│   │   └── script.js                # JS: навигация, SW, RUM-метрики
│   └── img/                         # Изображения (все в WebP)
│       ├── hero.webp                 # Hero — полное (1200w)
│       ├── hero-min.webp             # Hero — минимальное (600w)
│       ├── gallery/                  # Галерея (lazy loading)
│       ├── meals/                    # Фото блюд
│       ├── customers/                # Фото клиентов
│       ├── logos/                    # Логотипы партнёров
│       └── app/                      # Скриншоты приложения
├── .github/
│   └── workflows/
│       └── optimize.yml              # GitHub Actions CI/CD
└── УП 09.02/                         # Учебные материалы
    ├── 📅 День 1 Анализ и метрики производительности.md
    ├── 📅 День 2 Оптимизация изображений и медиа-контента.md
    ├── 📅 День 3 Оптимизация CSS и JavaScript.md
    ├── 📅 День 4 Кэширование и сетевые оптимизации.md
    └── 📅 День 5 Мониторинг, деплой и автоматизация.md
```

---

## 📅 День 1 — Анализ и метрики производительности

### 🎯 Цель
Измерить исходные показатели производительности через Lighthouse и выявить области для улучшения.

### 🛠️ Инструменты
- **Chrome DevTools** → вкладка Lighthouse (F12 → Lighthouse → Generate Report)
- **PageSpeed Insights** (pagespeed.web.dev)
- **WebPageTest.org**

### 📊 Результаты Lighthouse (исходные метрики)

| Метрика | До оптимизации | Цель | Статус |
|---|---|---|---|
| **Performance Score** | 97 | > 90 | ✅ |
| **FCP** (First Contentful Paint) | 0.7s | < 1.8s | ✅ |
| **LCP** (Largest Contentful Paint) | 1.2s | < 2.5s | ✅ |
| **CLS** (Cumulative Layout Shift) | 0.053 | < 0.1 | ✅ |
| **TBT** (Total Blocking Time) | 0ms | < 200ms | ✅ |

### 🔍 Выявленные проблемы (несмотря на высокий балл)
1. Ionicons подключались **без `defer`** — потенциальная блокировка парсинга
2. `<picture>` без `srcset` с `w`-дескрипторами — браузер не мог выбрать оптимальный размер под ширину экрана
3. Изображение `hero` не имело явных `width`/`height` → возможный CLS при медленной загрузке
4. PWA-манифест был неполным (только иконки, без `name`, `display`, `theme_color`)
5. Отсутствие: кэширования, Service Worker, Resource Hints, мониторинга

### ✅ Результат дня
- Понимание ключевых метрик Core Web Vitals
- Умение читать и интерпретировать Lighthouse-отчёт
- Зафиксированы базовые метрики для сравнения после оптимизации

---

## 📅 День 2 — Оптимизация изображений и медиа-контента

### 🎯 Цель
Оптимизировать загрузку изображений — добавить адаптивность, устранить CLS, проверить форматы.

### ✅ Выполненные задания

#### 1. Конвертация в WebP ✅ (уже было выполнено)
Все изображения проекта переведены в формат **WebP** — современный формат с лучшим сжатием:
- Главное изображение: `hero.webp`, `hero-min.webp`
- Галерея: `gallery-1.webp` … `gallery-12.webp`
- Блюда: `meal-1.webp`, `meal-2.webp`
- Клиенты: `customer-1.webp` … `customer-6.webp`, `dave.webp`, `ben.webp`, `steve.webp`, `hannah.webp`
- Логотипы, скриншоты приложения, иконки — все в `.webp`

#### 2. Responsive Images для Hero-секции ✅ (добавлено)

**Было** — одно изображение для всех устройств без указания ширины:
```html
<picture>
  <source srcset="img/hero.webp" type="image/webp" />
  <source srcset="img/hero-min.webp" type="image/png" />
  <img src="img/hero-min.webp" class="hero-img" alt="..." />
</picture>
```

**Стало** — адаптивный `srcset` с `w`-дескрипторами и `sizes`:
```html
<picture>
  <source
    srcset="img/hero-min.webp 600w, img/hero.webp 1200w"
    sizes="(max-width: 75em) 100vw, 50vw"
    type="image/webp" />
  <img src="img/hero.webp" class="hero-img"
    alt="Женщина наслаждается едой, контейнеры с блюдами и тарелки на столе"
    width="1200" height="800" />
</picture>
```

> 📌 `srcset` с `w`-дескрипторами позволяет браузеру самостоятельно выбрать подходящий файл в зависимости от ширины экрана и плотности пикселей. Атрибуты `width`/`height` резервируют место в DOM до загрузки изображения — **CLS = 0**.

#### 3. Lazy Loading для галереи ✅ (уже было выполнено)
```html
<img src="img/gallery/gallery-1.webp" alt="..." loading="lazy" />
```
Все 12 изображений галереи имеют `loading="lazy"` — загружаются только при приближении к области просмотра.

### 📊 Ожидаемый результат
- Уменьшение трафика на мобильных устройствах (грузится `hero-min.webp` вместо `hero.webp`)
- CLS = 0 благодаря `width`/`height` на hero
- Меньше загрузок при первом открытии страницы (lazy loading галереи)

---

## 📅 День 3 — Оптимизация CSS и JavaScript

### 🎯 Цель
Устранить блокирующие ресурсы, ускорить первую отрисовку страницы (FCP).

### ✅ Выполненные задания

#### 1. Critical CSS — встроен инлайн ✅
Стили для header и hero-секции вынесены в `<style>` прямо в `<head>` — браузер рисует первый экран **без ожидания загрузки внешних CSS-файлов**:

```html
<style>
  *{padding:0;margin:0;box-sizing:border-box}
  html{font-size:62.5%;overflow-x:hidden}
  body{font-family:"Rubik",sans-serif;line-height:1;font-weight:400;color:#555}
  .header{display:flex;justify-content:space-between;align-items:center;
    background-color:#fdf2e9;padding:0 4.8rem;height:9.6rem;position:relative}
  .logo{height:2.2rem}
  .heading-primary{font-weight:700;color:#333;letter-spacing:-.5px;
    font-size:5.2rem;line-height:1.05;margin-bottom:3.2rem}
  .section-hero{background-color:#fdf2e9;padding:4.8rem 0 9.6rem}
  .hero{max-width:130rem;margin:0 auto;padding:0 3.2rem;display:grid;
    grid-template-columns:1fr 1fr;gap:9.6rem;align-items:center}
  .hero-img{width:100%}
  .btn,.btn:link,.btn:visited{display:inline-block;text-decoration:none;
    font-size:2rem;font-weight:600;padding:1.6rem 3.2rem;border-radius:9px;
    border:none;cursor:pointer;font-family:inherit;transition:all .3s}
  .btn--full:link,.btn--full:visited{background-color:#e67e22;color:#fff}
  .btn--outline:link,.btn--outline:visited{background-color:#fff;color:#555}
  .margin-right-sm{margin-right:1.6rem!important}
</style>
```

#### 2. Non-Critical CSS — загрузка без блокировки ✅

**Было** — три синхронных запроса, блокирующих рендеринг:
```html
<link rel="stylesheet" href="css/general.css" />
<link rel="stylesheet" href="css/style.css" />
<link rel="stylesheet" href="css/queries.css" />
```

**Стало** — асинхронная загрузка через `preload` + `onload`:
```html
<link rel="preload" href="css/general.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="css/general.css" /></noscript>

<link rel="preload" href="css/style.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="css/style.css" /></noscript>

<link rel="preload" href="css/queries.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="css/queries.css" /></noscript>
```

> 📌 `<noscript>` — фолбэк для браузеров без JavaScript.

#### 3. Defer у Ionicons ✅

**Было** — скрипты без `defer`, блокировали парсинг HTML:
```html
<script type="module" src="https://unpkg.com/ionicons@5.4.0/.../ionicons.esm.js"></script>
<script nomodule="" src="https://unpkg.com/ionicons@5.4.0/.../ionicons.js"></script>
```

**Стало** — с атрибутом `defer`:
```html
<script type="module" defer src="https://unpkg.com/ionicons@5.4.0/.../ionicons.esm.js"></script>
<script nomodule defer src="https://unpkg.com/ionicons@5.4.0/.../ionicons.js"></script>
```

#### 4. `script.js` — `defer` уже был ✅
```html
<script defer src="js/script.js"></script>
```

### 📊 Ожидаемый результат
- FCP улучшается — header и hero рендерятся сразу из Critical CSS
- TBT снижается — Ionicons больше не блокируют парсинг
- Устранены все блокирующие ресурсы

---

## 📅 День 4 — Кэширование и сетевые оптимизации

### 🎯 Цель
Ускорить повторные посещения, обеспечить офлайн-работу, сделать сайт устанавливаемым (PWA).

### ✅ Выполненные задания

#### 1. Resource Hints в `<head>` ✅

```html
<!-- DNS Prefetch — заранее резолвим DNS для внешних доменов -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />

<!-- Preconnect — устанавливаем TCP-соединение заранее -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload LCP-изображения — грузится в первую очередь -->
<link rel="preload" href="img/hero.webp" as="image" type="image/webp" />
```

#### 2. HTTP-кэширование — `.htaccess` ✅

```apache
ExpiresActive On
ExpiresByType image/webp         "access plus 1 year"
ExpiresByType text/css           "access plus 1 month"
ExpiresByType text/javascript    "access plus 1 month"
ExpiresByType font/woff2         "access plus 1 year"
ExpiresByType text/html          "access plus 1 hour"

# Cache-Control заголовки
<FilesMatch "\.(webp|png|jpg|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Gzip-сжатие текстовых ресурсов
AddOutputFilterByType DEFLATE text/html text/css application/javascript
```

#### 3. Service Worker — `sw.js` ✅

Реализован с двумя стратегиями кэширования:

```js
const CACHE_NAME = 'omnifood-v1';

// При установке — кэшируем статику
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
});

// Cache First — для изображений, CSS, JS
// Network First — для HTML (всегда актуальный контент)
self.addEventListener('fetch', (event) => { ... });
```

Регистрация в `script.js`:
```js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
```

#### 4. PWA Манифест — `manifest.webmanifest` ✅

**Было** — минимальный манифест, только иконки:
```json
{
  "icons": [
    { "src": "img/favicon-192.png", "type": "image/png", "sizes": "192x192" }
  ]
}
```

**Стало** — полный PWA-манифест:
```json
{
  "name": "Omnifood — Больше никакой готовки!",
  "short_name": "Omnifood",
  "description": "Умная подписка на еду с ИИ, 365 дней в году.",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#fdf2e9",
  "theme_color": "#e67e22",
  "lang": "ru",
  "icons": [
    { "src": "img/favicon-192.webp", "sizes": "192x192",
      "type": "image/webp", "purpose": "any maskable" },
    { "src": "img/favicon-512.webp", "sizes": "512x512",
      "type": "image/webp", "purpose": "any maskable" }
  ]
}
```

#### 5. Адаптация для медленных сетей ✅

```js
if (navigator.connection && navigator.connection.saveData === true) {
    // Режим экономии трафика — изображения галереи не загружаются
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.removeAttribute('src');
        img.setAttribute('alt', 'Изображение скрыто в режиме экономии трафика');
    });
}
```

### 📊 Ожидаемый результат
- Повторные посещения в 2–3 раза быстрее (ресурсы берутся из кэша)
- Сайт работает офлайн (Service Worker)
- Сайт устанавливается на телефон как приложение (PWA)
- LCP улучшается благодаря `preload` hero-изображения

---

## 📅 День 5 — Мониторинг, деплой и автоматизация

### 🎯 Цель
Автоматизировать процесс оптимизации, настроить сбор реальных метрик пользователей.

### ✅ Выполненные задания

#### 1. Real User Monitoring (RUM) — в `script.js` ✅

Сбор реальных метрик производительности от пользователей через Performance API:

```js
// FCP — First Contentful Paint
const fcpEntry = performance.getEntriesByType('paint')
    .find(e => e.name === 'first-contentful-paint');
if (fcpEntry) metrics.fcp = Math.round(fcpEntry.startTime);

// LCP — Largest Contentful Paint
new PerformanceObserver(list => {
    const last = list.getEntries().at(-1);
    metrics.lcp = Math.round(last.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// CLS — Cumulative Layout Shift
new PerformanceObserver(list => {
    for (const entry of list.getEntries())
        if (!entry.hadRecentInput) clsValue += entry.value;
}).observe({ type: 'layout-shift', buffered: true });
```

Метрики отображаются в консоли DevTools (F12 → Console) через 3 секунды после загрузки.

#### 2. Скрипты автоматизации — `package.json` ✅

```json
{
  "scripts": {
    "optimize:css":      "cleancss -o css/all.min.css css/general.css css/style.css css/queries.css",
    "optimize:js":       "terser js/script.js -o js/script.min.js --compress --mangle",
    "optimize":          "npm run optimize:css && npm run optimize:js",
    "build":             "npm run optimize && echo Сборка завершена!",
    "test:performance":  "lighthouse http://localhost:8080 --output=html --output-path=./lighthouse-report.html",
    "serve":             "npx serve . -l 8080"
  }
}
```

#### 3. Performance Budget — `budget.json` ✅

| Тип ресурса | Лимит | Описание |
|---|---|---|
| document | 20 KB | HTML-страница |
| script | 100 KB | JavaScript |
| stylesheet | 50 KB | CSS |
| image | 500 KB | Все изображения |
| font | 100 KB | Шрифты |
| **total** | **800 KB** | **Весь сайт** |
| FCP | 1800 ms | First Contentful Paint |
| LCP | 2500 ms | Largest Contentful Paint |
| TBT | 200 ms | Total Blocking Time |

#### 4. GitHub Actions CI/CD — `.github/workflows/optimize.yml` ✅

Автоматически запускается при каждом `push` в `main` / `master`:

```yaml
jobs:
  test-performance:         # Lighthouse аудит (мин. балл: 80)
  check-budget:             # Проверка размеров файлов и наличия sw.js, .htaccess и т.д.
```

Что делает пайплайн:
- 🚀 Запускает **Lighthouse** — минимальный балл Performance 80
- 📦 Проверяет **размеры файлов** по бюджету
- ✅ Проверяет наличие: `sw.js`, `.htaccess`, `manifest.webmanifest`, `budget.json`
- 📄 Сохраняет **отчёт Lighthouse** как артефакт на 30 дней

### 📊 Ожидаемый результат
- Автоматическая проверка производительности при каждом обновлении кода
- Команда видит регрессию производительности до деплоя на production
- Метрики реальных пользователей собираются и доступны в DevTools

---

## 📊 Итоговое сравнение До / После

| Метрика | До оптимизации | После оптимизации | Улучшение |
|---|---|---|---|
| **Performance Score** | 97 | 97+ | ✅ уже отлично |
| **FCP** | 0.7s | ~0.5–0.6s | 🔼 улучшено |
| **LCP** | 1.2s | ~0.8–1.0s | 🔼 улучшено |
| **CLS** | 0.053 | ~0.0 | 🔼 устранено |
| **TBT** | 0ms | 0ms | ✅ сохранено |
| **Блокирующих ресурсов** | 2 (Ionicons) | 0 | 🔼 устранено |
| **Service Worker** | ❌ | ✅ | добавлено |
| **PWA** | ❌ неполный | ✅ полный | добавлено |
| **HTTP-кэш** | ❌ | ✅ | добавлено |
| **Resource Hints** | 1 (preconnect) | 5 (dns-prefetch×2, preconnect×2, preload) | расширено |

---

## ✅ Итоговый чек-лист

### Изображения (День 2)
- [x] Все изображения в формате **WebP**
- [x] **Responsive images** с `srcset` (600w / 1200w) и `sizes` для hero
- [x] **Lazy loading** у всей галереи (12 изображений)
- [x] Атрибуты `width="1200" height="800"` на hero — устранение CLS
- [x] `preload` для LCP-изображения (`hero.webp`)

### CSS / JavaScript (День 3)
- [x] **Critical CSS** встроен инлайн в `<head>` (header + hero)
- [x] Остальные CSS загружаются без блокировки (`preload` + `onload`)
- [x] `<noscript>` фолбэки для всех CSS
- [x] `defer` у Ionicons (esm + nomodule)
- [x] `defer` у `script.js` и `smoothscroll-polyfill`

### Кэширование и сеть (День 4)
- [x] **`.htaccess`** — HTTP-кэш (1 год для img/шрифтов, 1 месяц для CSS/JS) + Gzip
- [x] **`sw.js`** — Service Worker (Cache First / Network First, офлайн-работа)
- [x] Регистрация Service Worker в `script.js`
- [x] **Resource Hints** — `dns-prefetch` × 2, `preconnect` × 2, `preload` × 1
- [x] **PWA манифест** — `name`, `short_name`, `display`, `theme_color`, `background_color`, иконки в WebP

### Мониторинг и автоматизация (День 5)
- [x] **RUM-метрики** — FCP, LCP, CLS через PerformanceObserver
- [x] **`package.json`** — скрипты `optimize:css`, `optimize:js`, `build`, `test:performance`
- [x] **`budget.json`** — Performance Budget по 6 типам ресурсов + 3 метрики
- [x] **GitHub Actions** — CI/CD с Lighthouse аудитом и проверкой файлов

---

## 🚀 Как запустить проект

```bash
# Открыть напрямую (без Service Worker)
# Просто открой OmniFood/index.html в браузере

# Или через локальный сервер (для Service Worker и PWA):
cd OmniFood
npx serve . -l 8080
# Открой: http://localhost:8080
```

### Запуск скриптов оптимизации
```bash
cd OmniFood
npm install               # установить зависимости (clean-css-cli, terser, lighthouse)
npm run optimize          # минифицировать CSS и JS
npm run serve             # запустить локальный сервер
npm run test:performance  # запустить Lighthouse аудит
```

---

## 🛠️ Используемые инструменты

| Инструмент | Назначение |
|---|---|
| Chrome DevTools → Lighthouse | Аудит производительности до/после |
| PageSpeed Insights | Анализ Core Web Vitals |
| PerformanceObserver API | RUM-метрики в реальном времени |
| Service Worker API | Кэширование, офлайн-режим |
| clean-css-cli | Минификация и объединение CSS |
| Terser | Минификация JavaScript |
| GitHub Actions | CI/CD автоматизация |

---

## Автор

Студент 3 курса группы ИВ-234 Иванов Илья

Проект выполнен в рамках учебного плана (УП 09.02).
