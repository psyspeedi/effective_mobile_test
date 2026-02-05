import 'express-session';
import { Role } from '@/entities/user/model';

// Расширение типа Session для включения пользовательских данных
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: Role;
  }
}
