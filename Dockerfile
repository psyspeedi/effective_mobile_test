FROM node:20-alpine AS base

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копируем исходники
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Development stage
FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Копируем только необходимое
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
