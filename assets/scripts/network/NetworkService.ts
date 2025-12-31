/**
 * 网络服务 - 简化版
 * Network Service - Simplified
 */

import { createLogger, Scene, decodeSnapshot, decodeSpawn, decodeDespawn, SyncOperation, Entity, type DecodeSpawnResult } from '@esengine/ecs-framework';
import { rpc, RpcClient, connect } from '@esengine/rpc';
import { MsgTypes, PlayerComponent, EnemyComponent, CollectibleComponent, CollectibleType as SharedCollectibleType } from '@example/lawn-mower-shared';
import { authService } from '../auth';
import { Transform, Movement, Health, Renderable, ColliderComponent, NetworkPlayer, PlayerInput, CameraTarget, Weapon, Collectible, CollectibleType } from '../ecs/components';
import { RenderSystem } from '../ecs/systems/RenderSystem';
import { AIComponent } from '../ecs/systems/AISystem';
import { EntityTags } from '../ecs/EntityTags';

/**
 * @zh 射击事件数据
 * @en Shoot event data
 */
interface ShootEventData {
    playerId: string;
    x: number;
    y: number;
    angle: number;
    timestamp: number;
}

const logger = createLogger('Network');

// RPC 协议定义
const protocol = rpc.define({
    api: {
        JoinRoom: rpc.api<{ roomType: string }, { roomId: string; playerId: string }>(),
        LeaveRoom: rpc.api<void, { success: boolean }>(),
    },
    msg: {
        RoomMessage: rpc.msg<{ type: string; data: unknown }>(),
    },
});

type Protocol = typeof protocol;

/**
 * 简化的网络服务
 */
class NetworkService {
    private static _instance: NetworkService;
    private _client: RpcClient<Protocol> | null = null;
    private _scene: Scene | null = null;
    private _playerId: string = '';
    private _onShoot: ((data: ShootEventData) => void) | null = null;
    private _onKicked: ((message: string) => void) | null = null;

    /**
     * @zh 服务器实体ID到客户端实体的映射
     * @en Server entity ID to client entity mapping
     */
    private _serverEntityMap: Map<number, Entity> = new Map();

    /**
     * @zh 客户端实体到服务器实体ID的映射（反向）
     * @en Client entity to server entity ID mapping (reverse)
     */
    private _entityServerIdMap: Map<Entity, number> = new Map();

    static get instance(): NetworkService {
        return this._instance ??= new NetworkService();
    }

    get isConnected(): boolean {
        return this._client?.isConnected ?? false;
    }

    get playerId(): string {
        return this._playerId;
    }

    /**
     * 设置场景（用于接收状态同步）
     */
    setScene(scene: Scene): void {
        this._scene = scene;
    }

    /**
     * 设置射击回调
     */
    onShoot(callback: (data: ShootEventData) => void): void {
        this._onShoot = callback;
    }

    /**
     * 设置被踢回调
     */
    onKicked(callback: (message: string) => void): void {
        this._onKicked = callback;
    }

    /**
     * 连接并加入房间
     */
    async connect(url: string, playerName: string): Promise<string> {
        // 验证登录状态
        if (!authService.isLoggedIn) {
            throw new Error('Not logged in');
        }

        this._client = await connect(protocol, url, {
            autoReconnect: true,
            onConnect: () => logger.info('已连接'),
            onDisconnect: (r) => logger.info(`断开: ${r}`),
            onError: (e) => logger.error('错误:', e),
        });

        // 监听房间消息
        this._client.on('RoomMessage', (msg) => this.handleMessage(msg.type, msg.data));

        // 加入房间
        const result = await this._client.call('JoinRoom', { roomType: 'game' });
        this._playerId = result.playerId;
        logger.info(`加入房间: ${result.roomId}`);

        // 发送 JoinGame（包含认证信息）
        this.send(MsgTypes.JoinGame, {
            playerName,
            userId: authService.userId,
            token: authService.token,
        });

        return this._playerId;
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this._client?.disconnect();
        this._client = null;
        this._playerId = '';
        this._serverEntityMap.clear();
        this._entityServerIdMap.clear();
    }

    /**
     * 发送输入
     */
    sendInput(dx: number, dy: number, shoot: boolean, seq: number = 0): void {
        this.send(MsgTypes.Input, { dx, dy, shoot, seq });
    }

    /**
     * 发送射击
     */
    sendShoot(targetX: number, targetY: number): void {
        this.send(MsgTypes.Shoot, { targetX, targetY });
    }

    /**
     * @zh 发送敌人受击消息
     * @en Send enemy hit message
     */
    sendEnemyHit(enemy: Entity, damage: number): void {
        const serverEntityId = this._entityServerIdMap.get(enemy);
        if (serverEntityId !== undefined) {
            this.send(MsgTypes.EnemyHit, { enemyId: serverEntityId, damage });
        }
    }

    /**
     * @zh 获取实体的服务器ID
     * @en Get server ID for entity
     */
    getServerEntityId(entity: Entity): number | undefined {
        return this._entityServerIdMap.get(entity);
    }

    private send(type: string, data: unknown): void {
        this._client?.send('RoomMessage', { type, data });
    }

    private handleMessage(type: string, data: unknown): void {
        switch (type) {
            case '$sync':
                if (!this._scene) return;
                // 状态同步（二进制）
                const syncData = data as { data: number[] };
                const bytes = new Uint8Array(syncData.data);
                this.handleSync(bytes);
                break;

            case 'Shoot':
                // 射击事件
                this._onShoot?.(data as ShootEventData);
                break;

            case 'AirStrike':
                // 空袭事件 - 触发客户端空袭效果
                this._scene?.eventSystem.emit('airstrike:activate', data);
                break;

            case 'error':
                // 错误消息（如被踢）
                const errorData = data as { message: string };
                logger.warn(`Server error: ${errorData.message}`);
                this._onKicked?.(errorData.message);
                this.disconnect();
                break;
        }
    }

    private handleSync(data: Uint8Array): void {
        if (!this._scene || data.length === 0) return;

        const op = data[0];
        switch (op) {
            case SyncOperation.FULL:
            case SyncOperation.DELTA:
                decodeSnapshot(this._scene, data, this._serverEntityMap);
                this.updateEntitiesFromSync();
                break;
            case SyncOperation.SPAWN:
                const serverEntityId = this.extractServerEntityId(data);
                const spawnResult = decodeSpawn(this._scene, data, this._serverEntityMap);
                if (spawnResult) {
                    if (serverEntityId !== null) {
                        this._serverEntityMap.set(serverEntityId, spawnResult.entity);
                        this._entityServerIdMap.set(spawnResult.entity, serverEntityId);
                    }
                    this.setupSpawnedEntity(spawnResult.entity, spawnResult.prefabType, serverEntityId ?? undefined);
                }
                break;
            case SyncOperation.DESPAWN:
                const result = decodeDespawn(data);
                if (result) {
                    for (const entityId of result.entityIds) {
                        // 先从映射中查找，再从场景中查找
                        const entity = this._serverEntityMap.get(entityId) || this._scene.findEntityById(entityId);
                        if (entity) {
                            entity.destroy();
                            this._serverEntityMap.delete(entityId);
                            this._entityServerIdMap.delete(entity);
                        }
                    }
                }
                break;
        }
    }

    /**
     * @zh 从 spawn 数据中提取服务器实体ID
     * @en Extract server entity ID from spawn data
     */
    private extractServerEntityId(data: Uint8Array): number | null {
        // SPAWN 消息格式: [op:1, entityId:4, prefabType:varint+string, ...]
        if (data.length < 5) return null;

        // 读取实体ID (位置 1-4, little endian uint32)
        const entityId = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
        return entityId;
    }

    /**
     * 为同步生成的实体添加客户端组件
     * Setup client-side components for spawned entity
     */
    private setupSpawnedEntity(entity: Entity, prefabType: string, serverEntityId?: number): void {

        switch (prefabType) {
            case 'Player':
                this.setupPlayerEntity(entity, serverEntityId);
                break;
            case 'Enemy':
                this.setupEnemyEntity(entity);
                break;
            case 'Collectible':
                this.setupCollectibleEntity(entity);
                break;
            default:
                logger.warn(`Unknown prefab type: ${prefabType}`);
        }
    }

    /**
     * 设置玩家实体的客户端组件
     */
    private setupPlayerEntity(entity: Entity, serverEntityId?: number): void {
        const playerComp = entity.getComponent(PlayerComponent);
        if (!playerComp) return;

        const isLocalPlayer = playerComp.playerId === this._playerId;

        entity.tag = EntityTags.PLAYER;

        // 添加 Transform（如果没有）
        if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform(playerComp.x, playerComp.y, 0));
        }

        // 添加 Movement
        if (!entity.getComponent(Movement)) {
            entity.addComponent(new Movement(180));
        }

        // 添加 NetworkPlayer 组件用于插值
        if (!entity.getComponent(NetworkPlayer)) {
            const networkPlayer = new NetworkPlayer();
            networkPlayer.init(playerComp.playerId, isLocalPlayer, playerComp.playerName);
            entity.addComponent(networkPlayer);
        }

        // 本地玩家专用组件
        if (isLocalPlayer) {
            // 添加输入组件
            if (!entity.getComponent(PlayerInput)) {
                entity.addComponent(new PlayerInput());
            }

            // 添加摄像机目标
            if (!entity.getComponent(CameraTarget)) {
                entity.addComponent(new CameraTarget(100));
            }

            // 添加武器
            if (!entity.getComponent(Weapon)) {
                const weapon = new Weapon(30, 16);
                weapon.bulletSpeed = 600;
                weapon.bulletLifeTime = 2;
                weapon.bulletSize = 4;
                weapon.pierceCount = 1;
                weapon.autoFire = true;
                entity.addComponent(weapon);
            }
        }

        // 添加渲染组件
        if (!entity.getComponent(Renderable)) {
            entity.addComponent(RenderSystem.createPlayer());
        }

        // 添加碰撞组件
        if (!entity.getComponent(ColliderComponent)) {
            const collider = new ColliderComponent('circle');
            collider.setSize(15);
            entity.addComponent(collider);
        }

        // 添加生命值
        if (!entity.getComponent(Health)) {
            entity.addComponent(new Health(playerComp.health));
        }

    }

    /**
     * 设置敌人实体的客户端组件
     */
    private setupEnemyEntity(entity: Entity): void {
        const enemyComp = entity.getComponent(EnemyComponent);
        if (!enemyComp) return;

        entity.tag = EntityTags.ENEMY;

        // 添加 Transform
        if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform(enemyComp.x, enemyComp.y, 0));
        }

        // 添加 Movement
        if (!entity.getComponent(Movement)) {
            entity.addComponent(new Movement(enemyComp.speed));
        }

        // 添加 AI
        if (!entity.getComponent(AIComponent)) {
            entity.addComponent(new AIComponent());
        }

        // 添加渲染组件
        if (!entity.getComponent(Renderable)) {
            entity.addComponent(RenderSystem.createEnemy());
        }

        // 添加碰撞组件
        if (!entity.getComponent(ColliderComponent)) {
            const collider = new ColliderComponent('circle');
            collider.setSize(8);
            entity.addComponent(collider);
        }

        // 添加生命值
        if (!entity.getComponent(Health)) {
            entity.addComponent(new Health(enemyComp.health));
        }

    }

    /**
     * 设置收集物实体的客户端组件
     */
    private setupCollectibleEntity(entity: Entity): void {
        const collectibleComp = entity.getComponent(CollectibleComponent);
        if (!collectibleComp) return;

        entity.tag = EntityTags.COLLECTIBLE;

        // 添加 Transform
        if (!entity.getComponent(Transform)) {
            entity.addComponent(new Transform(collectibleComp.x, collectibleComp.y, 0));
        }

        // 添加本地 Collectible 组件（用于 CollectibleSystem 检测碰撞和触发效果）
        if (!entity.getComponent(Collectible)) {
            const localType = this.mapCollectibleType(collectibleComp.collectibleType);
            entity.addComponent(new Collectible(localType, collectibleComp.value));
        }

        // 添加渲染组件
        if (!entity.getComponent(Renderable)) {
            entity.addComponent(RenderSystem.createCollectible());
        }

        // 添加碰撞组件
        if (!entity.getComponent(ColliderComponent)) {
            const collider = new ColliderComponent('circle');
            collider.setSize(20);
            entity.addComponent(collider);
        }

    }

    /**
     * @zh 将共享的收集物类型映射到本地类型
     * @en Map shared collectible type to local type
     */
    private mapCollectibleType(sharedType: SharedCollectibleType): CollectibleType {
        switch (sharedType) {
            case SharedCollectibleType.AirStrike:
                return CollectibleType.AIR_STRIKE;
            default:
                return CollectibleType.AIR_STRIKE;
        }
    }

    /**
     * 从同步数据更新实体位置
     */
    private updateEntitiesFromSync(): void {
        const entities = this._scene?.entities.buffer || [];

        for (const entity of entities) {
            const playerComp = entity.getComponent(PlayerComponent);
            if (playerComp) {
                const transform = entity.getComponent(Transform);
                const networkPlayer = entity.getComponent(NetworkPlayer);

                if (networkPlayer) {
                    // 更新网络位置信息
                    networkPlayer.networkPosition = { x: playerComp.x, y: playerComp.y };
                    networkPlayer.networkRotation = playerComp.rotation;
                    networkPlayer.networkVelocity = { x: playerComp.vx, y: playerComp.vy };

                    if (networkPlayer.isLocalPlayer && transform) {
                        // 本地玩家：服务器校正
                        this.reconcileLocalPlayer(transform, networkPlayer, playerComp);
                    } else {
                        // 远程玩家：添加位置快照到缓冲区（使用框架的 SnapshotBuffer）
                        networkPlayer.addPositionSnapshot(
                            { x: playerComp.x, y: playerComp.y },
                            playerComp.rotation,
                            { x: playerComp.vx, y: playerComp.vy }
                        );
                        // 注意：不直接更新 transform，由 MovementSystem 从缓冲区插值
                    }
                } else if (transform) {
                    // 没有 NetworkPlayer 组件，直接更新
                    transform.position.x = playerComp.x;
                    transform.position.y = playerComp.y;
                    transform.rotation = playerComp.rotation;
                }
            }

            // 更新敌人
            const enemyComp = entity.getComponent(EnemyComponent);
            if (enemyComp) {
                const transform = entity.getComponent(Transform);
                if (transform) {
                    transform.position.x = enemyComp.x;
                    transform.position.y = enemyComp.y;
                }
            }
        }
    }

    /**
     * @zh 服务器校正本地玩家位置
     * @en Reconcile local player position with server
     */
    private reconcileLocalPlayer(transform: Transform, networkPlayer: NetworkPlayer, serverState: PlayerComponent): void {
        const serverX = serverState.x;
        const serverY = serverState.y;
        const clientX = transform.position.x;
        const clientY = transform.position.y;

        // 计算位置差异
        const dx = serverX - clientX;
        const dy = serverY - clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.1) {
            // 差异很小，不需要校正
            return;
        }

        if (networkPlayer.needsHardCorrection(serverX, serverY, clientX, clientY)) {
            // 差异太大，直接瞬移到服务器位置
            transform.position.x = serverX;
            transform.position.y = serverY;
            transform.rotation = serverState.rotation;
            networkPlayer.pendingCorrection.x = 0;
            networkPlayer.pendingCorrection.y = 0;
            // 清空位置缓冲区
            networkPlayer.clearPositionBuffer();
        } else if (distance > networkPlayer.reconciliationThreshold) {
            // 差异中等，设置平滑校正
            networkPlayer.setCorrection(dx, dy);
        }
        // 差异小于阈值，不做校正，信任客户端预测
    }
}

export const networkService = NetworkService.instance;
export { NetworkService };
export type { ShootEventData };
