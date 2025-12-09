"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendResetEmail = exports.getTransporter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
const nodemailer_1 = __importDefault(require("nodemailer"));
const { SMTP_HOST, SMTP_PORT = '587', SMTP_SECURE = 'false', SMTP_USER, SMTP_PASS, SMTP_FROM = 'no-reply@portal.local', } = process.env;
// Create transporter lazily
const getTransporter = () => {
    if (!SMTP_HOST) {
        throw new Error('SMTP_HOST not configured');
    }
    return nodemailer_1.default.createTransport({
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
exports.getTransporter = getTransporter;
const sendResetEmail = async (to, tempPassword) => {
    const transporter = (0, exports.getTransporter)();
    const mail = {
        from: SMTP_FROM,
        to,
        subject: 'Your Portal temporary password',
        text: `Here is your temporary password: ${tempPassword}\n\nPlease log in and change it.`,
    };
    await transporter.sendMail(mail);
};
exports.sendResetEmail = sendResetEmail;
const sendVerificationEmail = async (to, verifyUrl) => {
    const transporter = (0, exports.getTransporter)();
    const mail = {
        from: SMTP_FROM,
        to,
        subject: 'Verify your Portal email',
        text: `Welcome! Please verify your email by visiting this link: ${verifyUrl}`,
    };
    await transporter.sendMail(mail);
};
exports.sendVerificationEmail = sendVerificationEmail;
