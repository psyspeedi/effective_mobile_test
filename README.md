# Effective Mobile Test - User Management API

REST API сервис для управления пользователями с аутентификацией на основе сессий.

## Технологический стек

- **TypeScript** - язык программирования
- **Node.js** - runtime окружение
- **Express** - веб-фреймворк
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **Docker** - контейнеризация
- **bcrypt** - хеширование паролей
- **express-session** - управление сессиями
- **winston** - логирование

## Архитектура

Проект организован по методологии **Feature-Sliced Design (FSD)**:

```
src/
├── app/              # Инициализация приложения
├── entities/         # Бизнес-сущности (User)
├── features/         # Фичи (auth, user-management)
└── shared/           # Общие модули (lib, middleware, types)
```

## Требования

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 20

## Быстрый старт (Demo режим)

Запуск одной командой:

```bash
git clone https://github.com/psyspeedi/effective_mobile_test.git
cd effective_mobile_test
npm run demo:start
```

Скрипт автоматически:
- Запустит PostgreSQL и приложение в Docker
- Дождётся готовности PostgreSQL (healthcheck)
- Применит миграции базы данных
- Загрузит тестовые данные (admin пользователь)

API будет доступен на `http://localhost:3001`

Тестовый администратор:
- Email: `admin@example.com`
- Пароль: `admin123`

## Development режим (основной)

PostgreSQL в Docker, backend локально:

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить .env

```bash
cp .env.example .env
```

Убедитесь что `DATABASE_URL` указывает на PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/effective_mobile
```

### 3. Запустить PostgreSQL

```bash
npm run db:start
```

### 4. Применить миграции

```bash
npm run prisma:migrate
```

### 5. Seed (опционально)

```bash
npm run prisma:seed
```

Это создаст тестового администратора (email/пароль из `.env`).

### 6. Запустить приложение

```bash
npm run dev
```

API будет доступен на `http://localhost:3001` с hot-reload.

## Development команды

### PostgreSQL

```bash
npm run db:start      # Запустить
npm run db:stop       # Остановить
npm run db:logs       # Логи
npm run db:restart    # Перезапуск
npm run db:clean      # Удалить volumes (удалит данные БД!)
```

### Приложение

```bash
npm run dev           # Запуск с hot-reload
npm run build         # Сборка
npm run lint          # Линтинг
```

### Prisma

```bash
npm run prisma:migrate    # Миграции
npm run prisma:generate   # Генерация Client
npm run prisma:seed       # Тестовые данные
```

### Demo режим

```bash
npm run demo:start    # Запустить всё в Docker (миграции применяются автоматически)
npm run demo:stop     # Остановить
npm run demo:logs     # Логи приложения
npm run demo:build    # Пересобрать образ
npm run demo:rebuild  # Пересобрать без кеша
npm run demo:clean    # Удалить всё (volumes + контейнеры)
```

## API Endpoints

Все API endpoints доступны с префиксом `/api/v1`

### Аутентификация

- `POST /api/v1/auth/register` - Регистрация нового пользователя
- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/logout` - Выход из системы

### Управление пользователями

- `GET /api/v1/users/:id` - Получить пользователя по ID (админ или сам себя)
- `GET /api/v1/users` - Список всех пользователей (только админ)
- `PATCH /api/v1/users/:id/block` - Заблокировать пользователя (админ или сам себя)

### Health Check

- `GET /health` - Проверка состояния сервиса (без префикса)

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `PORT` | Порт приложения | `3001`               |
| `NODE_ENV` | Окружение | `development`        |
| `POSTGRES_USER` | Имя пользователя PostgreSQL | `postgres`           |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | `postgres`           |
| `POSTGRES_DB` | Имя базы данных | `effective_mobile`   |
| `POSTGRES_PORT` | Порт PostgreSQL | `5432`               |
| `DATABASE_URL` | URL подключения к базе | cм. .env.example     |
| `SESSION_SECRET` | Секретный ключ для сессий | `secret`             |

## Структура базы данных

### Модель User

```prisma
model User {
  id        String   @id @default(uuid())
  fullName  String
  birthDate DateTime
  email     String   @unique
  password  String   // Хешированный
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  USER
}
```

## Безопасность

- Пароли хешируются с помощью **bcrypt**
- Используются **HTTP-only cookies** для сессий
- Сессии хранятся в памяти (для production по-хорошему использовать Redis)
- Заблокированные пользователи (`isActive = false`) не могут войти в систему

## Разработка

### Линтинг

Проект использует ESLint с TypeScript. Pre-commit hook автоматически запускает линтер через husky и lint-staged.

```bash
npm run lint
```

### Миграции базы данных

```bash
# Создать новую миграцию
npx prisma migrate dev --name <название>

# Применить миграции (production)
npx prisma migrate deploy

# Сбросить базу (удалит все данные)
npx prisma migrate reset
```
