import { PrismaClient } from '@prisma/client';
import { createDefaultAdmin } from '../src/features/auth/lib/admin-setup.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем seeding базы данных...');

  // Получаем параметры администратора из переменных окружения
  // Если переменные не заданы, используем дефолтные значения для development
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminFullName = process.env.ADMIN_FULL_NAME || 'System Administrator';
  const adminBirthDate = process.env.ADMIN_BIRTH_DATE || '1990-01-01';

  console.log('\n Создание дефолтного администратора...');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Имя: ${adminFullName}`);

  try {
    const result = await createDefaultAdmin(prisma, {
      email: adminEmail,
      password: adminPassword,
      fullName: adminFullName,
      birthDate: adminBirthDate,
    });

    if (result.created) {
      console.log('Администратор успешно создан');
    } else {
      console.log('Администратор обновлен (уже существовал)');
    }

    console.log(`   ID: ${result.user.id}`);
    console.log(`   Роль: ${result.user.role}`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
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
