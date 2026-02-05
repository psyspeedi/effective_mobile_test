import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL не найден в .env файле');
  process.exit(1);
}

console.log(process.env.DATABASE_URL);
