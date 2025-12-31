/**
 * @zh 游客登录接口
 * @en Guest login API
 */

import { defineHttp } from '@esengine/server';

interface GuestResponse {
    success: boolean;
    token: string;
    userId: string;
    username: string;
}

export default defineHttp({
    method: 'POST',
    handler(_req, res) {
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const guestName = `Guest_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const token = `${guestId}-${Date.now()}`;

        res.json({
            success: true,
            token,
            userId: guestId,
            username: guestName,
        } satisfies GuestResponse);
    },
});
