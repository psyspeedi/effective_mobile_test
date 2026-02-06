#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { createDefaultAdmin } from '../src/features/auth/lib/admin-setup.js';
import { config } from '../src/app/config/env.js';
import { parseAndValidateDate } from '../src/shared/lib/date-utils.js';

const prisma = new PrismaClient();

/**
 * Валидация email адреса
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация пароля
 */
function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Валидация даты в формате YYYY-MM-DD
 */
function isValidDate(dateString: string): boolean {
  return parseAndValidateDate(dateString) !== null;
}

/**
 * Получение параметров из переменных окружения или аргументов командной строки
 */
function getAdminParams(): {
  email: string;
  password: string;
  fullName: string;
  birthDate: string;
} {
  // Приоритет: аргументы командной строки > переменные окружения > ошибка
  const args = process.argv.slice(2);

  let email = config.admin.email;
  let password = config.admin.password;
  let fullName = config.admin.fullName;
  let birthDate = config.admin.birthDate;

  // Парсинг аргументов командной строки (поддержка --key=value и --key value)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    } else if (arg === '--email' && args[i + 1]) {
      email = args[i + 1];
      i++;
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1];
    } else if (arg === '--password' && args[i + 1]) {
      password = args[i + 1];
      i++;
    } else if (arg.startsWith('--name=')) {
      fullName = arg.split('=')[1];
    } else if (arg === '--name' && args[i + 1]) {
      fullName = args[i + 1];
      i++;
    } else if (arg.startsWith('--birth-date=')) {
      birthDate = arg.split('=')[1];
    } else if (arg === '--birth-date' && args[i + 1]) {
      birthDate = args[i + 1];
      i++;
    }
  }

  // Валидация обязательных параметров
  if (!email || !password) {
    console.error('Ошибка: Email и пароль обязательны!');
    console.error('\nИспользование:');
    console.error('  npm run admin:create -- --email=admin@example.com --password=SecurePass123');
    console.error('\nИли через переменные окружения:');
    console.error('  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 npm run admin:create');
    console.error('\nДополнительные параметры:');
    console.error('  --name="Full Name"          Полное имя (по умолчанию: System Administrator)');
    console.error('  --birth-date=YYYY-MM-DD     Дата рождения (по умолчанию: 1990-01-01)');
    process.exit(1);
  }

  return { email, password, fullName, birthDate };
}

async function main() {
  console.log('Создание администратора...\n');

  try {
    // Получаем параметры
    const params = getAdminParams();

    // Валидация email
    if (!isValidEmail(params.email)) {
      console.error(`Неверный формат email: ${params.email}`);
      process.exit(1);
    }

    // Валидация пароля
    if (!isValidPassword(params.password)) {
      console.error('Пароль должен содержать минимум 6 символов');
      process.exit(1);
    }

    // Валидация даты рождения
    if (!isValidDate(params.birthDate)) {
      console.error(`Неверный формат даты рождения: ${params.birthDate}`);
      console.error('   Ожидается формат: YYYY-MM-DD (например, 1990-01-01)');
      process.exit(1);
    }

    console.log('Параметры администратора:');
    console.log(`   Email: ${params.email}`);
    console.log(`   Имя: ${params.fullName}`);
    console.log(`   Дата рождения: ${params.birthDate}`);
    console.log(`   Пароль: ${'*'.repeat(params.password.length)}\n`);

    // Создаем администратора
    const result = await createDefaultAdmin(prisma, params);

    if (result.created) {
      console.log('Администратор успешно создан!');
    } else {
      console.log('Администратор обновлен (уже существовал)!');
    }

    console.log(`\nID: ${result.user.id}`);
    console.log(`Email: ${result.user.email}`);
    console.log(`Роль: ${result.user.role}`);
    console.log(`Активен: ${result.user.isActive ? 'Да' : 'Нет'}`);

    console.log('\nГотово! Вы можете войти с указанными credentials.');
  } catch (error) {
    console.error('\nОшибка при создании администратора:');
    if (error instanceof Error) {
      console.error(`${error.message}`);
    } else {
      console.error('Неизвестная ошибка');
    }
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
