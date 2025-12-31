/**
 * @zh Lawn Mower Demo 服务端入口
 * @en Lawn Mower Demo Server Entry
 */
import { Core, createLogger } from '@esengine/ecs-framework';
import { createServer } from '@esengine/server';
import { GameRoom } from './rooms/GameRoom.js';
const logger = createLogger('Server');
async function main() {
    // 初始化 ECS Core（服务端环境）
    Core.create({ runtimeEnvironment: 'server' });
    // 创建服务器（启用 HTTP 文件路由）
    // Create server (with HTTP file routing enabled)
    const server = await createServer({
        port: 8080,
        httpDir: 'src/http',
        httpPrefix: '/api',
        cors: true,
    });
    // 注册房间类型
    server.define('game', GameRoom);
    // 启动服务器
    await server.start();
    logger.info('Server started:');
    logger.info('  WebSocket: ws://localhost:8080');
    logger.info('  HTTP API:  http://localhost:8080/api');
    // ECS 更新循环
    let lastTime = Date.now();
    setInterval(() => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        Core.update(dt);
    }, 16); // ~60 FPS
}
main().catch((err) => {
    logger.error('Server failed to start:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map