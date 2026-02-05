import session from 'express-session';
import { config } from './env';

// Конфигурация express-session
export const sessionConfig: session.SessionOptions = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.isProduction, // HTTPS только в production
    maxAge: config.sessionMaxAge,
    sameSite: 'lax',
  },
  name: 'sessionId',
};
