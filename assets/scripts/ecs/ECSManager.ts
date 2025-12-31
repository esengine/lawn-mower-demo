import { Core, createLogger } from '@esengine/ecs-framework';
import { Component, _decorator, Vec2, Node, director } from 'cc';
import { GameScene } from './scenes/GameScene';
import { networkService, type ShootEventData } from '../network';
import { ECSConsoleDebug } from './debug/ECSConsoleDebug';
import { Transform, Projectile, ColliderComponent, Renderable } from './components';
import { RenderSystem } from './systems/RenderSystem';
import { EntityTags } from './EntityTags';
import { authService } from '../auth';
import { LoginView } from '../ui-ecs/views/LoginView';

const { ccclass, property } = _decorator;

@ccclass('ECSManager')
export class ECSManager extends Component {

    @property({ tooltip: '是否启用调试模式' })
    debugMode: boolean = true;

    @property({ tooltip: '是否启用网络模式' })
    enableNetwork: boolean = true;

    @property({ tooltip: '服务器地址' })
    serverUrl: string = 'ws://localhost:8080';

    @property({ tooltip: '玩家名称' })
    playerName: string = 'Player';

    @property({ type: Node, tooltip: '登录界面节点（可选）' })
    loginViewNode: Node | null = null;

    @property({ tooltip: '是否需要登录（启用后会先显示登录界面）' })
    requireLogin: boolean = false;

    @property({ tooltip: '登录场景名（被踢后跳转）' })
    loginSceneName: string = 'login';

    private logger = createLogger('ECSManager');
    private isInitialized: boolean = false;
    private gameScene: GameScene | null = null;

    async start() {
        if (this.requireLogin && this.loginViewNode) {
            // 显示登录界面，等待登录完成
            this.showLogin();
        } else {
            // 直接初始化游戏
            await this.initialize();
        }
    }

    /**
     * @zh 显示登录界面
     * @en Show login view
     */
    private showLogin(): void {
        if (!this.loginViewNode) return;

        this.loginViewNode.active = true;
        const loginView = this.loginViewNode.getComponent(LoginView);

        if (loginView) {
            loginView.onLoginSuccess(async (username) => {
                this.playerName = username;
                this.loginViewNode!.active = false;
                await this.initialize();
            });
        }
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // 初始化 ECS
            Core.create(this.debugMode ? {
                debugConfig: {
                    enabled: true,
                    websocketUrl: 'ws://localhost:9229/ecs-debug',
                    channels: {
                        entities: true,
                        systems: true,
                        performance: true,
                        components: true,
                        scenes: true
                    }
                }
            } : false);

            // 创建游戏场景
            this.gameScene = new GameScene();

            // 网络模式下禁用本地敌人生成（敌人由服务器生成）
            if (this.enableNetwork) {
                this.gameScene.setNetworkMode(true);
            }

            Core.setScene(this.gameScene);
            this.gameScene.setECSManager(this);

            // 网络初始化
            if (this.enableNetwork) {
                // 设置场景用于接收状态同步
                networkService.setScene(this.gameScene);

                // 射击回调 - 为远程玩家创建子弹
                networkService.onShoot((data) => {
                    this.handleRemoteShoot(data);
                });

                // 被踢回调 - 显示提示并返回登录界面
                networkService.onKicked((message) => {
                    this.handleKicked(message);
                });

                // 连接服务器
                const playerId = await networkService.connect(this.serverUrl, this.playerName);
                this.logger.info(`已连接，玩家ID: ${playerId}`);

                // 注意：不再预创建本地玩家，由服务器 spawn 消息创建
                // 这样可以确保服务器和客户端的初始位置一致
            }

            // 调试工具
            if (this.debugMode) {
                ECSConsoleDebug.getInstance().init(this);
            }

            this.isInitialized = true;
            this.logger.info('初始化完成');

        } catch (error) {
            this.logger.error('初始化失败:', error);
        }
    }

    update(deltaTime: number) {
        if (this.isInitialized) {
            Core.update(deltaTime);
        }
    }

    onDestroy() {
        networkService.disconnect();

        // 销毁 Core（会自动清理 scene）
        Core.destroy();

        this.gameScene = null;
        this.isInitialized = false;
    }

    // 公共方法
    sendInput(dx: number, dy: number, shoot: boolean = false): void {
        networkService.sendInput(dx, dy, shoot);
    }

    sendShoot(targetX: number, targetY: number): void {
        networkService.sendShoot(targetX, targetY);
    }

    /**
     * @zh 处理被踢事件
     * @en Handle kicked event
     */
    private handleKicked(message: string): void {
        this.logger.warn(`被踢出游戏: ${message}`);

        // 登出
        authService.logout();

        // 显示提示（使用简单的 alert，实际项目中应使用 UI 弹窗）
        if (typeof window !== 'undefined' && window.alert) {
            window.alert(message);
        }

        // 跳转回登录场景
        director.loadScene(this.loginSceneName);
    }

    /**
     * @zh 处理远程玩家射击事件
     * @en Handle remote player shoot event
     */
    private handleRemoteShoot(data: ShootEventData): void {
        // 跳过本地玩家的射击（本地玩家的子弹由 WeaponSystem 创建）
        if (data.playerId === networkService.playerId) {
            return;
        }

        if (!this.gameScene) return;

        // 计算射击方向
        const direction = new Vec2(Math.cos(data.angle), Math.sin(data.angle));

        // 创建子弹实体
        const bullet = this.gameScene.createEntity('RemoteBullet');
        bullet.tag = EntityTags.BULLET;

        // Transform
        const transform = new Transform(data.x, data.y, 0);
        transform.rotation = data.angle;
        bullet.addComponent(transform);

        // Projectile
        const projectile = new Projectile(10, 600, 2);
        projectile.setDirection(direction);
        bullet.addComponent(projectile);

        // Renderable
        bullet.addComponent(RenderSystem.createBullet());

        // Collider
        const collider = new ColliderComponent('circle');
        collider.setSize(4);
        bullet.addComponent(collider);

        this.logger.debug(`远程玩家 ${data.playerId} 射击，创建子弹`);
    }
}
