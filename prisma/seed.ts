import { PrismaClient, Role } from '@prisma/client';
import { createDefaultAdmin } from '../src/features/auth/lib/admin-setup.js';
import { hashPassword } from '../src/features/auth/lib/password.js';
import { parseAndValidateDate } from '../src/shared/lib/date-utils.js';

const prisma = new PrismaClient();

/**
 * Проверяет наличие обязательной переменной окружения
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Отсутствует обязательная переменная окружения: ${name}\n` +
        `   Добавьте её в файл .env\n` +
        `   Пример: ${name}=значение`
    );
  }
  return value;
}

async function main() {
  console.log('Начинаем seeding базы данных...');

  // Получаем параметры администратора из переменных окружения (обязательные)
  const adminEmail = requireEnv('ADMIN_EMAIL');
  const adminPassword = requireEnv('ADMIN_PASSWORD');
  const adminFullName = requireEnv('ADMIN_FULL_NAME');
  const adminBirthDate = requireEnv('ADMIN_BIRTH_DATE');

  // Создание администратора
  console.log('\nСоздание дефолтного администратора...');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Имя: ${adminFullName}`);

  try {
    const adminResult = await createDefaultAdmin(prisma, {
      email: adminEmail,
      password: adminPassword,
      fullName: adminFullName,
      birthDate: adminBirthDate,
    });

    if (adminResult.created) {
      console.log('Администратор успешно создан');
    } else {
      console.log('Администратор обновлен (уже существовал)');
    }

    console.log(`   ID: ${adminResult.user.id}`);
    console.log(`   Роль: ${adminResult.user.role}`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    throw error;
  }

  // Создание тестового пользователя (обязательные переменные)
  const testUserEmail = requireEnv('TEST_USER_EMAIL');
  const testUserPassword = requireEnv('TEST_USER_PASSWORD');
  const testUserFullName = requireEnv('TEST_USER_FULL_NAME');
  const testUserBirthDate = requireEnv('TEST_USER_BIRTH_DATE');

  // Валидируем дату рождения тестового пользователя
  const testUserDate = parseAndValidateDate(testUserBirthDate);
  if (!testUserDate) {
    throw new Error(`Невалидная дата рождения тестового пользователя: ${testUserBirthDate}`);
  }

  console.log('\nСоздание тестового пользователя...');
  console.log(`   Email: ${testUserEmail}`);
  console.log(`   Имя: ${testUserFullName}`);

  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: testUserEmail },
    });

    if (!existingUser) {
      const hashedPassword = await hashPassword(testUserPassword);

      const testUser = await prisma.user.create({
        data: {
          email: testUserEmail,
          password: hashedPassword,
          fullName: testUserFullName,
          birthDate: testUserDate,
          role: Role.USER,
          isActive: true,
        },
      });

      console.log('Тестовый пользователь успешно создан');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Роль: ${testUser.role}`);
    } else {
      console.log('Тестовый пользователь уже существует');
      console.log(`   ID: ${existingUser.id}`);
    }
  } catch (error) {
    console.error('Ошибка при создании тестового пользователя:', error);
    throw error;
  }

  console.log('\nSeeding завершен успешно!');
}

main()
  .catch((error) => {
    console.error('Критическая ошибка при seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
