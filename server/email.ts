import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'no-reply@portal.local',
} = process.env;

// Create transporter lazily
export const getTransporter = () => {
  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST not configured');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });
};

export const sendResetEmail = async (to: string, tempPassword: string) => {
  const transporter = getTransporter();
  const mail = {
    from: SMTP_FROM,
    to,
    subject: 'Your Portal temporary password',
    text: `Here is your temporary password: ${tempPassword}\n\nPlease log in and change it.`,
  };
  await transporter.sendMail(mail);
};

export const sendVerificationEmail = async (to: string, verifyUrl: string) => {
  const transporter = getTransporter();
  const mail = {
    from: SMTP_FROM,
    to,
    subject: 'Verify your Portal email',
    text: `Welcome! Please verify your email by visiting this link: ${verifyUrl}`,
  };
  await transporter.sendMail(mail);
};
