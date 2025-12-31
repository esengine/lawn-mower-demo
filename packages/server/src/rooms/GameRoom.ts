/**
 * @zh 游戏房间
 * @en Game Room
 *
 * @zh 简洁的房间实现，游戏逻辑由共享系统处理
 * @en Clean room implementation, game logic handled by shared systems
 */

import { createLogger, encodeSpawn, getNetworkEntityMetadata } from '@esengine/ecs-framework';
import { Player } from '@esengine/server';
import { ECSRoom, onMessage } from '@esengine/server/ecs';
import { getUserRepository } from '../db.js';
import {
    // Components
    PlayerComponent,
    CollectibleComponent,
    CollectibleType,
    EnemyComponent,
    // Systems
    PlayerMovementSystem,
    EnemyAISystem,
    EnemySpawnSystem,
    CollectibleSpawnSystem,
    AirStrikeSpawnSystem,
    // Types & Constants
    MsgTypes,
    ServerEvents,
    PLAYER_MOVE_SPEED,
    PLAYER_INITIAL_HEALTH,
    MAP_BOUNDS,
    type JoinGameMsg,
    type InputMsg,
    type ShootMsg,
    type EnemyHitMsg,
} from '@example/lawn-mower-shared';

const logger = createLogger('GameRoom');

/**
 * @zh 游戏房间
 * @en Game Room
 *
 * @zh 职责：
 * - 玩家连接/断开管理
 * - 消息处理（输入、射击）
 * - 注册共享系统
 * - 处理网络广播回调
 *
 * @en Responsibilities:
 * - Player connection/disconnection management
 * - Message handling (input, shoot)
 * - Register shared systems
 * - Handle network broadcast callbacks
 */
export class GameRoom extends ECSRoom {
    maxPlayers = 8;
    tickRate = 60;

    /** @zh userId -> Player 映射，用于检测重复登录 */
    private onlineUsers = new Map<string, Player>();
    /** @zh playerId -> userId 映射 */
    private playerUserMap = new Map<string, string>();

    // =========================================================================
    // Lifecycle | 生命周期
    // =========================================================================

    onCreate(): void {
        logger.info(`Room created: ${this.id}`);
        this.setupSystems();
    }

    /**
     * @zh 设置游戏系统
     * @en Setup game systems
     *
     * @zh 使用 @NetworkEntity 装饰器后，spawn/despawn 自动广播
     * @en With @NetworkEntity decorator, spawn/despawn is broadcast automatically
     */
    private setupSystems(): void {
        // 玩家移动系统
        this.addSystem(new PlayerMovementSystem());

        // 敌人 AI 系统 - 死亡时系统内部调用 destroy()，@NetworkEntity 自动广播
        this.addSystem(new EnemyAISystem());

        // 敌人生成系统
        this.addSystem(new EnemySpawnSystem());

        // 空袭生成系统 - 通过消息广播同步
        const airStrikeSpawn = new AirStrikeSpawnSystem();
        airStrikeSpawn.onBroadcast((event) => {
            this.broadcast(ServerEvents.AirStrike, event);
        });
        this.addSystem(airStrikeSpawn);

        // 收集物生成系统 - 仅需处理收集后的业务逻辑
        const collectibleSpawn = new CollectibleSpawnSystem();
        collectibleSpawn.onCollect((collectible, player) => {
            const collectibleComp = collectible.getComponent(CollectibleComponent);
            const playerComp = player.getComponent(PlayerComponent);

            logger.info(`Collectible collected by player ${playerComp?.playerId}`);

            if (collectibleComp && playerComp) {
                if (collectibleComp.collectibleType === CollectibleType.AirStrike) {
                    logger.info(`Triggering air strike at (${playerComp.x}, ${playerComp.y})`);
                    airStrikeSpawn.triggerAirStrike(playerComp.x, playerComp.y);
                }
            }

            collectible.destroy();
        });
        this.addSystem(collectibleSpawn);
    }

    onJoin(player: Player): void {
        logger.info(`Player connected: ${player.id}`);
    }

    override async onLeave(player: Player, reason?: string): Promise<void> {
        logger.info(`Player leaving: ${player.id}`);

        // 清理用户在线状态
        const userId = this.playerUserMap.get(player.id);
        if (userId) {
            this.onlineUsers.delete(userId);
            this.playerUserMap.delete(player.id);
        }

        await super.onLeave(player, reason);
    }

    onDispose(): void {
        logger.info(`Room disposed: ${this.id}`);
        super.onDispose();
    }

    // =========================================================================
    // Message Handlers | 消息处理
    // =========================================================================

    @onMessage(MsgTypes.JoinGame)
    handleJoinGame(data: JoinGameMsg, player: Player): void {
        const { playerName, userId, token } = data;
        logger.info(`Player joining: ${playerName} (userId: ${userId})`);

        // 验证 token 格式（简单验证：token 应以 userId 开头）
        if (!token || !userId || !token.startsWith(userId)) {
            logger.warn(`Invalid token for player ${playerName}`);
            player.send('error', { message: 'Invalid token' });
            return;
        }

        // 检查是否已有相同用户在线 - 踢掉旧连接
        const existingPlayer = this.onlineUsers.get(userId);
        if (existingPlayer && existingPlayer.id !== player.id) {
            logger.info(`Kicking duplicate login for userId: ${userId}`);
            existingPlayer.send('error', { message: '账号在其他地方登录' });
            this.kickPlayer(existingPlayer);
        }

        // 记录用户在线状态
        this.onlineUsers.set(userId, player);
        this.playerUserMap.set(player.id, userId);

        // 先向新玩家发送所有已存在的实体
        this.sendExistingEntities(player);

        // 创建玩家实体
        const entity = this.createPlayerEntity(player.id);

        // 先初始化组件数据，再添加到实体
        // @NetworkEntity 在 addComponent 时广播，确保数据正确
        const comp = new PlayerComponent();
        comp.playerId = player.id;
        comp.playerName = playerName;
        comp.health = PLAYER_INITIAL_HEALTH;
        comp.x = (Math.random() - 0.5) * (MAP_BOUNDS.maxX - MAP_BOUNDS.minX) * 0.8;
        comp.y = (Math.random() - 0.5) * (MAP_BOUNDS.maxY - MAP_BOUNDS.minY) * 0.8;

        entity.addComponent(comp); // 自动广播 spawn（数据已初始化）

        logger.info(`Player ${playerName} spawned at (${comp.x.toFixed(1)}, ${comp.y.toFixed(1)})`);
    }

    /**
     * @zh 踢出玩家
     * @en Kick player
     */
    private kickPlayer(player: Player): void {
        const userId = this.playerUserMap.get(player.id);
        if (userId) {
            this.onlineUsers.delete(userId);
            this.playerUserMap.delete(player.id);
        }
        player.leave();
    }

    @onMessage(MsgTypes.Input)
    handleInput(data: InputMsg, player: Player): void {
        const entity = this.getPlayerEntity(player.id);
        if (!entity) return;

        const comp = entity.getComponent(PlayerComponent);
        if (!comp) return;

        // 处理输入
        const len = Math.sqrt(data.dx * data.dx + data.dy * data.dy);
        if (len > 0) {
            comp.vx = (data.dx / len) * PLAYER_MOVE_SPEED;
            comp.vy = (data.dy / len) * PLAYER_MOVE_SPEED;
            comp.rotation = Math.atan2(data.dy, data.dx);
        } else {
            comp.vx = 0;
            comp.vy = 0;
        }

        // 射击
        if (data.shoot) {
            this.broadcastShoot(player.id, comp.x, comp.y, comp.rotation);
        }
    }

    @onMessage(MsgTypes.Shoot)
    handleShoot(data: ShootMsg, player: Player): void {
        const entity = this.getPlayerEntity(player.id);
        const comp = entity?.getComponent(PlayerComponent);
        if (!comp) return;

        const angle = Math.atan2(data.targetY - comp.y, data.targetX - comp.x);
        this.broadcastShoot(player.id, comp.x, comp.y, angle);
    }

    @onMessage(MsgTypes.EnemyHit)
    handleEnemyHit(data: EnemyHitMsg, player: Player): void {
        const enemy = this.scene.findEntityById(data.enemyId);
        if (!enemy) return;

        const enemyComp = enemy.getComponent(EnemyComponent);
        if (!enemyComp) return;

        enemyComp.health -= data.damage;
        logger.debug(`Enemy ${data.enemyId} hit for ${data.damage} damage, health: ${enemyComp.health}`);
    }

    // =========================================================================
    // Helpers | 辅助方法
    // =========================================================================

    private broadcastShoot(playerId: string, x: number, y: number, angle: number): void {
        this.broadcast(ServerEvents.Shoot, {
            playerId,
            x,
            y,
            angle,
            timestamp: Date.now(),
        });
    }

    /**
     * @zh 向新玩家发送所有已存在的实体
     * @en Send all existing entities to new player
     *
     * @zh 自动从 @NetworkEntity 元数据获取 prefabType
     * @en Automatically gets prefabType from @NetworkEntity metadata
     */
    private sendExistingEntities(player: Player): void {
        for (const entity of this.scene.entities.buffer) {
            // 遍历组件，查找 @NetworkEntity 元数据
            for (const component of entity.components) {
                const metadata = getNetworkEntityMetadata(component.constructor);
                if (metadata) {
                    const data = encodeSpawn(entity, metadata.prefabType);
                    player.send('$sync', { data: Array.from(data) });
                    break; // 每个实体只发送一次
                }
            }
        }
    }
}
