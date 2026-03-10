import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const HOST: string = process.env.HOST || '0.0.0.0';
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/defaultdb';

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default'

export const SMTP_HOST: string = process.env.SMTP_HOST || '';
export const SMTP_PORT: number = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
export const SMTP_USER: string = process.env.SMTP_USER || '';
export const SMTP_PASS: string = process.env.SMTP_PASS || '';
export const EMAIL_FROM: string = process.env.EMAIL_FROM || 'no-reply@example.com';
export const RESET_PASSWORD_URL: string =
    process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password';

export const FRONTEND_URL: string =
    process.env.FRONTEND_URL || 'http://localhost:3000';

export const REMINDER_INTERVAL_MINUTES: number =
    process.env.REMINDER_INTERVAL_MINUTES ? parseInt(process.env.REMINDER_INTERVAL_MINUTES) : 15;

export const REMINDER_LOOKAHEAD_HOURS: number =
    process.env.REMINDER_LOOKAHEAD_HOURS ? parseInt(process.env.REMINDER_LOOKAHEAD_HOURS) : 24;
    