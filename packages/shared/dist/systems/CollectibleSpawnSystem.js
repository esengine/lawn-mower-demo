/**
 * @zh 收集物生成系统（共享）
 * @en Collectible Spawn System (shared)
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { EntitySystem, Matcher, Time, ECSSystem } from '@esengine/ecs-framework';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { CollectibleComponent, CollectibleType } from '../components/CollectibleComponent.js';
import { COLLECTIBLE_SPAWN_INTERVAL, COLLECTIBLE_SPAWN_DISTANCE, COLLECTIBLE_COLLECT_RADIUS, MAX_COLLECTIBLES, MAP_BOUNDS, } from '../constants.js';
let CollectibleSpawnSystem = class CollectibleSpawnSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(PlayerComponent));
        this.spawnTimer = 0;
        this.onCollectHandler = null;
    }
    /**
     * @zh 设置收集物收集处理器
     * @en Set collectible collect handler
     */
    onCollect(handler) {
        this.onCollectHandler = handler;
        return this;
    }
    process(players) {
        if (players.length === 0)
            return;
        // 客户端跳过所有服务端权威逻辑
        if (!this.scene.isServer)
            return;
        // 检查收集（服务器权威）
        this.checkCollections(players);
        // 检查收集物数量上限（未被收集的）
        const collectibles = this.scene.queryAll(CollectibleComponent).entities;
        const activeCount = collectibles.filter(e => !e.getComponent(CollectibleComponent).isCollected).length;
        if (activeCount >= MAX_COLLECTIBLES)
            return;
        this.spawnTimer += Time.deltaTime;
        if (this.spawnTimer >= COLLECTIBLE_SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            this.spawnCollectible(players);
        }
    }
    spawnCollectible(players) {
        // 随机选择一个玩家
        const target = players[Math.floor(Math.random() * players.length)];
        const playerComp = target.getComponent(PlayerComponent);
        if (!playerComp)
            return;
        // 在玩家周围随机位置生成
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * COLLECTIBLE_SPAWN_DISTANCE;
        const spawnX = playerComp.x + Math.cos(angle) * distance;
        const spawnY = playerComp.y + Math.sin(angle) * distance;
        // 边界检查
        const x = Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, spawnX));
        const y = Math.max(MAP_BOUNDS.minY, Math.min(MAP_BOUNDS.maxY, spawnY));
        // 创建收集物 - 先初始化数据，再添加组件
        // @NetworkEntity 在 addComponent 时自动广播 spawn
        const entity = this.scene.createEntity('Collectible');
        const comp = new CollectibleComponent();
        comp.x = x;
        comp.y = y;
        comp.collectibleType = CollectibleType.AirStrike;
        comp.value = 1;
        entity.addComponent(comp);
    }
    /**
     * @zh 检查玩家收集
     * @en Check player collections
     */
    checkCollections(players) {
        for (const entity of this.scene.queryAll(CollectibleComponent).entities) {
            const comp = entity.getComponent(CollectibleComponent);
            if (comp.isCollected)
                continue;
            for (const player of players) {
                const playerComp = player.getComponent(PlayerComponent);
                if (!playerComp)
                    continue;
                const dx = playerComp.x - comp.x;
                const dy = playerComp.y - comp.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= COLLECTIBLE_COLLECT_RADIUS) {
                    comp.isCollected = 1;
                    this.onCollectHandler?.(entity, player);
                    break;
                }
            }
        }
    }
};
CollectibleSpawnSystem = __decorate([
    ECSSystem('CollectibleSpawnSystem'),
    __metadata("design:paramtypes", [])
], CollectibleSpawnSystem);
export { CollectibleSpawnSystem };
//# sourceMappingURL=CollectibleSpawnSystem.js.map