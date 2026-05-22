"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.changePassword = changePassword;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password required' });
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    if (!currentPassword || !newPassword)
        return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 6)
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcryptjs_1.default.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma.user.update({ where: { id: userId }, data: { password: hash } });
        res.json({ message: 'Password updated' });
    }
    catch {
        res.status(500).json({ error: 'Server error' });
    }
}
