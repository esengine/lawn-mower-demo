/**
 * @zh 登录接口
 * @en Login API
 */

import { defineHttp } from '@esengine/server';

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

// 简单的用户存储（实际项目应使用数据库）
// Simple user storage (use database in production)
const users = new Map<string, { password: string; id: string }>();

export default defineHttp<LoginBody>({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            res.error(400, 'Username and password are required');
            return;
        }

        const user = users.get(username);
        if (!user || user.password !== password) {
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

// 导出 users 供注册接口使用
// Export users for register API
export { users };
