"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = require("./db");
const email_1 = require("./email");
dotenv_1.default.config({ path: '.env.local' });
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
const PORT = Number(process.env.API_PORT || 4000);
const API_PUBLIC_URL = (process.env.API_PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const toUserDto = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    isVerified: !!row.is_verified,
    createdAt: row.created_at,
});
app.get('/api/health', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok', db: rows });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: 'DB not reachable', error: err.message });
    }
});
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    try {
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
        const user = {
            id: (0, uuid_1.v4)(),
            name,
            email,
            password_hash: passwordHash,
            role: 'user',
            status: 'pending',
            is_verified: 0,
            verification_token: verificationToken,
            created_at: Date.now(),
        };
        await db_1.pool.query(`INSERT INTO users (id, name, email, password_hash, role, status, is_verified, verification_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [user.id, user.name, user.email, user.password_hash, user.role, user.status, user.is_verified, user.verification_token, user.created_at]);
        // send verification email
        const verifyUrl = `${API_PUBLIC_URL}/api/auth/verify?token=${verificationToken}`;
        try {
            await (0, email_1.sendVerificationEmail)(email, verifyUrl);
        }
        catch (mailErr) {
            console.error('Failed to send verification email', mailErr);
        }
        res.json({ success: true, message: 'Account created. Check your email to verify before admin approval.' });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        console.error('Signup error', err);
        res.status(500).json({ success: false, message: 'Signup failed' });
    }
});
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing credentials' });
    }
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
        const user = rows[0];
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found.' });
        const ok = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!ok)
            return res.status(401).json({ success: false, message: 'Invalid password.' });
        if (!user.is_verified) {
            return res.status(403).json({ success: false, message: 'Email not verified. Please check your inbox.' });
        }
        if (user.status === 'pending') {
            return res.status(403).json({ success: false, message: 'Account is pending approval.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
        }
        res.json({ success: true, user: toUserDto(user) });
    }
    catch (err) {
        console.error('Login error', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});
app.post('/api/auth/forgot', async (req, res) => {
    const { email } = req.body || {};
    if (!email)
        return res.status(400).json({ success: false, message: 'Email required' });
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found for that email.' });
        }
        if (!user.is_verified) {
            return res.status(403).json({ success: false, message: 'Email not verified yet.' });
        }
        const tempPassword = Math.random().toString(36).slice(-10);
        const hash = await bcryptjs_1.default.hash(tempPassword, 10);
        await db_1.pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, user.id]);
        await (0, email_1.sendResetEmail)(email, tempPassword);
        res.json({ success: true, message: 'Temporary password sent to your email.' });
    }
    catch (err) {
        console.error('Forgot password error', err);
        res.status(500).json({ success: false, message: 'Could not process reset.' });
    }
});
app.get('/api/auth/verify', async (req, res) => {
    const token = req.query.token || '';
    if (!token)
        return res.status(400).send('Missing token');
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM users WHERE verification_token = ? LIMIT 1`, [token]);
        const user = rows[0];
        if (!user)
            return res.status(404).send('Invalid token');
        await db_1.pool.query(`UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?`, [user.id]);
        res.send('Email verified. You can now log in (admin approval may still be required).');
    }
    catch (err) {
        console.error('Verify error', err);
        res.status(500).send('Verification failed');
    }
});
app.post('/api/auth/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
        const user = rows[0];
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const ok = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!ok)
            return res.status(401).json({ success: false, message: 'Current password incorrect' });
        const hash = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, user.id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Change password error', err);
        res.status(500).json({ success: false, message: 'Could not change password' });
    }
});
app.get('/api/users', async (_req, res) => {
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
        res.json({ success: true, users: rows.map(toUserDto) });
    }
    catch (err) {
        console.error('List users error', err);
        res.status(500).json({ success: false, message: 'Failed to list users' });
    }
});
app.patch('/api/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    try {
        await db_1.pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Update status error', err);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});
app.post('/api/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    if (!newPassword)
        return res.status(400).json({ success: false, message: 'Missing new password' });
    try {
        const hash = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Admin set password error', err);
        res.status(500).json({ success: false, message: 'Failed to set password' });
    }
});
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db_1.pool.query(`SELECT email FROM users WHERE id = ? LIMIT 1`, [id]);
        const user = rows[0];
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        if (user.email === 'admin@portal.com') {
            return res.status(400).json({ success: false, message: 'Cannot delete root admin' });
        }
        await db_1.pool.query(`DELETE FROM users WHERE id = ?`, [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete user error', err);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});
const start = async () => {
    try {
        await (0, db_1.initDb)();
        app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
};
start();
