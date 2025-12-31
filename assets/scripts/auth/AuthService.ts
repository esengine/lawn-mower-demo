/**
 * @zh 认证服务 - 处理登录、注册、游客登录
 * @en Auth Service - Handle login, register, guest login
 */

import { createLogger } from '@esengine/ecs-framework';

const logger = createLogger('Auth');

export interface AuthResult {
    success: boolean;
    token?: string;
    userId?: string;
    username?: string;
    error?: string;
}

class AuthService {
    private static _instance: AuthService;
    private _baseUrl: string = 'http://localhost:8080/api';
    private _token: string = '';
    private _userId: string = '';
    private _username: string = '';

    static get instance(): AuthService {
        return this._instance ??= new AuthService();
    }

    get isLoggedIn(): boolean {
        return !!this._token;
    }

    get token(): string {
        return this._token;
    }

    get userId(): string {
        return this._userId;
    }

    get username(): string {
        return this._username;
    }

    /**
     * @zh 设置 API 基础 URL
     * @en Set API base URL
     */
    setBaseUrl(url: string): void {
        this._baseUrl = url;
    }

    /**
     * @zh 登录
     * @en Login
     */
    async login(username: string, password: string): Promise<AuthResult> {
        try {
            const response = await fetch(`${this._baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                this._token = data.token;
                this._userId = data.userId;
                this._username = username;
                logger.info(`登录成功: ${username}`);
            }

            return data;
        } catch (error) {
            logger.error('登录失败:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * @zh 注册
     * @en Register
     */
    async register(username: string, password: string): Promise<AuthResult> {
        try {
            const response = await fetch(`${this._baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                logger.info(`注册成功: ${username}`);
            }

            return data;
        } catch (error) {
            logger.error('注册失败:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * @zh 游客登录
     * @en Guest login
     */
    async guestLogin(): Promise<AuthResult> {
        try {
            const response = await fetch(`${this._baseUrl}/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (data.success) {
                this._token = data.token;
                this._userId = data.userId;
                this._username = data.username;
                logger.info(`游客登录成功: ${data.username}`);
            }

            return data;
        } catch (error) {
            logger.error('游客登录失败:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * @zh 登出
     * @en Logout
     */
    logout(): void {
        this._token = '';
        this._userId = '';
        this._username = '';
        logger.info('已登出');
    }
}

export const authService = AuthService.instance;
export { AuthService };
