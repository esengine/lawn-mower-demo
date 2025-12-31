/**
 * @zh 数据库配置
 * @en Database configuration
 */

import { createMongoConnection, type IMongoConnection } from '@esengine/database-drivers';
import { UserRepository } from '@esengine/database';
import { createLogger } from '@esengine/ecs-framework';

const logger = createLogger('Database');

let mongoConnection: IMongoConnection | null = null;
let userRepository: UserRepository | null = null;

/**
 * @zh 初始化数据库连接
 * @en Initialize database connection
 */
export async function initDatabase(): Promise<void> {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB || 'lawn_mower_demo';

    logger.info(`Connecting to MongoDB: ${mongoUri}/${dbName}`);

    mongoConnection = createMongoConnection({
        uri: mongoUri,
        database: dbName,
        autoReconnect: true
    });

    mongoConnection.on('connected', () => {
        logger.info('MongoDB connected');
    });

    mongoConnection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });

    mongoConnection.on('error', (e) => {
        logger.error('MongoDB error:', e.error);
    });

    await mongoConnection.connect();

    userRepository = new UserRepository(mongoConnection);

    // 创建默认测试用户（如果不存在）
    await ensureTestUsers();
}

/**
 * @zh 确保测试用户存在
 * @en Ensure test users exist
 */
async function ensureTestUsers(): Promise<void> {
    if (!userRepository) return;

    const testUsers = [
        { username: 'test', password: '123456' },
        { username: 'admin', password: 'admin123' }
    ];

    for (const { username, password } of testUsers) {
        const existing = await userRepository.findByUsername(username);
        if (!existing) {
            await userRepository.register({ username, password });
            logger.info(`Created test user: ${username}`);
        }
    }
}

/**
 * @zh 关闭数据库连接
 * @en Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (mongoConnection) {
        await mongoConnection.disconnect();
        mongoConnection = null;
        userRepository = null;
    }
}

/**
 * @zh 获取用户仓库
 * @en Get user repository
 */
export function getUserRepository(): UserRepository {
    if (!userRepository) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return userRepository;
}

/**
 * @zh 获取 MongoDB 连接
 * @en Get MongoDB connection
 */
export function getMongoConnection(): IMongoConnection {
    if (!mongoConnection) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return mongoConnection;
}
