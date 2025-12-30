/**
 * @zh 敌人 AI 系统（共享）
 * @en Enemy AI System (shared)
 *
 * @zh 服务器和客户端共用的敌人 AI 逻辑
 * @en Shared enemy AI logic for both server and client
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
import { EnemyComponent } from '../components/EnemyComponent.js';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { MAP_BOUNDS } from '../constants.js';
let EnemyAISystem = class EnemyAISystem extends EntitySystem {
    constructor() {
        super(Matcher.all(EnemyComponent));
    }
    process(entities) {
        // 客户端跳过 - 只有服务端运行 AI 逻辑
        if (!this.scene.isServer)
            return;
        const dt = Time.deltaTime;
        const players = this.scene.queryAll(PlayerComponent).entities;
        for (const entity of entities) {
            const enemyComp = entity.getComponent(EnemyComponent);
            if (!enemyComp)
                continue;
            // 检查是否死亡 - @NetworkEntity 自动广播 despawn
            if (enemyComp.health <= 0) {
                entity.destroy();
                continue;
            }
            // 更新 AI - 追踪最近玩家
            this.updateChaseAI(enemyComp, players, dt);
        }
    }
    updateChaseAI(enemyComp, players, dt) {
        const nearest = this.findNearestPlayer(players, enemyComp.x, enemyComp.y);
        if (!nearest)
            return;
        const playerComp = nearest.getComponent(PlayerComponent);
        if (!playerComp)
            return;
        // 更新目标
        enemyComp.targetPlayerId = playerComp.playerId;
        // 计算方向
        const dx = playerComp.x - enemyComp.x;
        const dy = playerComp.y - enemyComp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            // 归一化并移动
            enemyComp.vx = (dx / dist) * enemyComp.speed;
            enemyComp.vy = (dy / dist) * enemyComp.speed;
            enemyComp.rotation = Math.atan2(dy, dx);
            // 应用移动
            enemyComp.x += enemyComp.vx * dt;
            enemyComp.y += enemyComp.vy * dt;
            // 边界检查
            enemyComp.x = Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, enemyComp.x));
            enemyComp.y = Math.max(MAP_BOUNDS.minY, Math.min(MAP_BOUNDS.maxY, enemyComp.y));
        }
        else {
            enemyComp.vx = 0;
            enemyComp.vy = 0;
        }
    }
    findNearestPlayer(players, x, y) {
        let nearest = null;
        let nearestDistSq = Infinity;
        for (const player of players) {
            const comp = player.getComponent(PlayerComponent);
            if (!comp)
                continue;
            const dx = comp.x - x;
            const dy = comp.y - y;
            const distSq = dx * dx + dy * dy;
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearest = player;
            }
        }
        return nearest;
    }
};
EnemyAISystem = __decorate([
    ECSSystem('EnemyAISystem'),
    __metadata("design:paramtypes", [])
], EnemyAISystem);
export { EnemyAISystem };
//# sourceMappingURL=EnemyAISystem.js.map