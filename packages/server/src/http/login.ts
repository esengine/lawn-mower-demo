/**
 * @zh 登录接口
 * @en Login API
 */

import { defineHttp } from '@esengine/server';
import { getUserRepository } from '../db.js';

interface LoginBody {
    username: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    userId?: string;
    error?: string;
}

export default defineHttp<LoginBody>({
    method: 'POST',
    async handler(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            res.error(400, 'Username and password are required');
            return;
        }

        const userRepo = getUserRepository();
        const user = await userRepo.authenticate(username, password);

        if (!user) {
            res.json({
                success: false,
                error: 'Invalid username or password',
            } satisfies LoginResponse);
            return;
        }

        // 生成简单的 token（实际项目应使用 JWT）
        // Generate simple token (use JWT in production)
        const token = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        res.json({
            success: true,
            token,
            userId: user.id,
        } satisfies LoginResponse);
    },
});
