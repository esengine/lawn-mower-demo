import { Core, createLogger } from '@esengine/ecs-framework';
import { Component, _decorator, Vec2 } from 'cc';
import { GameScene } from './scenes/GameScene';
import { networkService, type ShootEventData } from '../network';
import { ECSConsoleDebug } from './debug/ECSConsoleDebug';
import { Transform, Projectile, ColliderComponent, Renderable } from './components';
import { RenderSystem } from './systems/RenderSystem';
import { EntityTags } from './EntityTags';

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

    private logger = createLogger('ECSManager');
    private isInitialized: boolean = false;
    private gameScene: GameScene | null = null;

    async start() {
        await this.initialize();
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
