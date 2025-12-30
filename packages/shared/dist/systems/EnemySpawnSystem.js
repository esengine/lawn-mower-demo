/**
 * @zh 敌人生成系统（共享）
 * @en Enemy Spawn System (shared)
 *
 * @zh 服务器和客户端共用的敌人生成逻辑
 * @en Shared enemy spawn logic for both server and client
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
import { EnemyComponent } from '../components/EnemyComponent.js';
import { ENEMY_SPAWN_INTERVAL, ENEMY_SPAWN_DISTANCE, ENEMY_INITIAL_HEALTH, ENEMY_MOVE_SPEED, MAX_ENEMIES, MAP_BOUNDS, } from '../constants.js';
let EnemySpawnSystem = class EnemySpawnSystem extends EntitySystem {
    constructor() {
        // 监听玩家（用于计算生成位置）
        super(Matcher.all(PlayerComponent));
        this.spawnTimer = 0;
    }
    process(players) {
        // 没有玩家时不生成
        if (players.length === 0)
            return;
        // 客户端跳过 - 只有服务端生成敌人
        if (!this.scene.isServer)
            return;
        // 检查敌人数量上限
        const enemyCount = this.scene.queryAll(EnemyComponent).entities.length;
        if (enemyCount >= MAX_ENEMIES)
            return;
        this.spawnTimer += Time.deltaTime;
        if (this.spawnTimer >= ENEMY_SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            this.spawnEnemy(players);
        }
    }
    spawnEnemy(players) {
        // 随机选择一个玩家
        const target = players[Math.floor(Math.random() * players.length)];
        const playerComp = target.getComponent(PlayerComponent);
        if (!playerComp)
            return;
        // 在玩家周围随机位置生成
        const angle = Math.random() * Math.PI * 2;
        const spawnX = playerComp.x + Math.cos(angle) * ENEMY_SPAWN_DISTANCE;
        const spawnY = playerComp.y + Math.sin(angle) * ENEMY_SPAWN_DISTANCE;
        // 边界检查
        const x = Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, spawnX));
        const y = Math.max(MAP_BOUNDS.minY, Math.min(MAP_BOUNDS.maxY, spawnY));
        // 创建敌人 - 先初始化数据，再添加组件
        // @NetworkEntity 在 addComponent 时自动广播 spawn
        const entity = this.scene.createEntity('Enemy');
        const enemyComp = new EnemyComponent();
        enemyComp.x = x;
        enemyComp.y = y;
        enemyComp.health = ENEMY_INITIAL_HEALTH;
        enemyComp.speed = ENEMY_MOVE_SPEED;
        enemyComp.targetPlayerId = playerComp.playerId;
        entity.addComponent(enemyComp);
    }
};
EnemySpawnSystem = __decorate([
    ECSSystem('EnemySpawnSystem'),
    __metadata("design:paramtypes", [])
], EnemySpawnSystem);
export { EnemySpawnSystem };
//# sourceMappingURL=EnemySpawnSystem.js.map