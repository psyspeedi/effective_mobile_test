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
- **Node.js** >= 20 (для локальной разработки без Docker)

## Быстрый старт с Docker

### 1. Клонировать репозиторий

```bash
git clone <repository-url>
cd effective_mobile_test
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
```

Отредактируйте `.env` при необходимости (по умолчанию настроено для локальной разработки).

### 3. Запустить приложение и базу данных

```bash
docker compose up -d
```

Это запустит:
- **PostgreSQL** на порту `5432`
- **API приложение** на порту `3000`

### 4. Применить миграции базы данных

```bash
docker compose exec app npx prisma migrate deploy
```

### 5. Проверить работу

API будет доступен по адресу: `http://localhost:3000`

## Локальная разработка (без Docker)

### 1. Установить зависимости

```bash
npm install
```

### 2. Запустить PostgreSQL

Вы можете использовать только PostgreSQL из Docker:

```bash
docker compose up -d postgres
```

Или установить PostgreSQL локально.

### 3. Настроить .env

Убедитесь что `DATABASE_URL` указывает на вашу PostgreSQL базу:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/effective_mobile
```

### 4. Применить миграции

```bash
npx prisma migrate dev
```

### 5. Запустить в режиме разработки

```bash
npm run dev
```

API будет доступен на `http://localhost:3000` с hot-reload.

## Доступные команды

### Docker команды

```bash
# Запустить все сервисы
docker compose up -d

# Остановить все сервисы
docker compose down

# Остановить и удалить volumes (удалит данные БД!)
docker compose down -v

# Посмотреть логи
docker compose logs -f app

# Пересобрать образ приложения
docker compose build app

# Выполнить команду в контейнере
docker compose exec app <command>
```

### NPM команды

```bash
# Разработка (hot-reload)
npm run dev

# Сборка проекта
npm run build

# Запуск production версии
npm start

# Линтинг
npm run lint

# Prisma команды
npm run prisma:migrate    # Создать и применить миграцию
npm run prisma:generate   # Сгенерировать Prisma Client
npm run prisma:studio     # Открыть Prisma Studio
```

## API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы

### Управление пользователями

- `GET /users/:id` - Получить пользователя по ID (админ или сам себя)
- `GET /users` - Список всех пользователей (только админ)
- `PATCH /users/:id/block` - Заблокировать пользователя (админ или сам себя)

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|-----------------------|
| `PORT` | Порт приложения | `3000` |
| `NODE_ENV` | Окружение | `development` |
| `POSTGRES_USER` | Имя пользователя PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | `postgres` |
| `POSTGRES_DB` | Имя базы данных | `effective_mobile` |
| `POSTGRES_PORT` | Порт PostgreSQL | `5432` |
| `DATABASE_URL` | URL подключения к базе | См. .env.example |
| `SESSION_SECRET` | Секретный ключ для сессий | Обязательно изменить! |

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
- Сессии хранятся в памяти (для production рекомендуется Redis)
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

# Сбросить базу (удалит все данные!)
npx prisma migrate reset
```

### Prisma Studio

Графический интерфейс для работы с базой данных:

```bash
npm run prisma:studio
```

Откроется на `http://localhost:5555`

## Production deployment

1. Установить переменные окружения
2. Изменить `SESSION_SECRET` на безопасное значение
3. Настроить `NODE_ENV=production`
4. Рассмотреть использование Redis для хранения сессий
5. Настроить reverse proxy (nginx)
6. Использовать managed PostgreSQL (AWS RDS, etc.)

## Лицензия

ISC
