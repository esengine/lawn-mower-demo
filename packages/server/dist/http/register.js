/**
 * @zh 注册接口
 * @en Register API
 */
import { defineHttp } from '@esengine/server';
import { users } from './login.js';
export default defineHttp({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            res.error(400, 'Username and password are required');
            return;
        }
        if (username.length < 3 || username.length > 20) {
            res.json({
                success: false,
                error: 'Username must be 3-20 characters',
            });
            return;
        }
        if (password.length < 6) {
            res.json({
                success: false,
                error: 'Password must be at least 6 characters',
            });
            return;
        }
        if (users.has(username)) {
            res.json({
                success: false,
                error: 'Username already exists',
            });
            return;
        }
        const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        users.set(username, { password, id: userId });
        res.json({
            success: true,
            userId,
        });
    },
});
//# sourceMappingURL=register.js.map