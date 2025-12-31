/**
 * @zh Lawn Mower Demo 服务端入口
 * @en Lawn Mower Demo Server Entry
 */
import { Core, createLogger } from '@esengine/ecs-framework';
import { createServer } from '@esengine/server';
import { GameRoom } from './rooms/GameRoom.js';
import { initDatabase, closeDatabase } from './db.js';
const logger = createLogger('Server');
async function main() {
    // 初始化 ECS Core（服务端环境）
    Core.create({ runtimeEnvironment: 'server' });
    // 初始化数据库
    await initDatabase();
    // 创建服务器（启用 HTTP 文件路由）
    // Create server (with HTTP file routing enabled)
    // 注意：httpDir 指向编译后的目录，而非源码目录
    // Note: httpDir points to compiled output, not source directory
    const server = await createServer({
        port: 8080,
        httpDir: './dist/http',
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
    // 优雅关闭
    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await closeDatabase();
        process.exit(0);
    });
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