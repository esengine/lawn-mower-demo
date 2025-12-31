/**
 * @zh 注册接口
 * @en Register API
 */

import { defineHttp } from '@esengine/server';
import { getUserRepository } from '../db.js';

interface RegisterBody {
    username: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    userId?: string;
    error?: string;
}

export default defineHttp<RegisterBody>({
    method: 'POST',
    async handler(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            res.error(400, 'Username and password are required');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            res.json({
                success: false,
                error: 'Username must be 3-20 characters',
            } satisfies RegisterResponse);
            return;
        }

        if (password.length < 6) {
            res.json({
                success: false,
                error: 'Password must be at least 6 characters',
            } satisfies RegisterResponse);
            return;
        }

        const userRepo = getUserRepository();

        try {
            const user = await userRepo.register({ username, password });

            res.json({
                success: true,
                userId: user.id,
            } satisfies RegisterResponse);
        } catch (err) {
            res.json({
                success: false,
                error: err instanceof Error ? err.message : 'Registration failed',
            } satisfies RegisterResponse);
        }
    },
});
