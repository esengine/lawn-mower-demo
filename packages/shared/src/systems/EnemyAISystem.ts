/**
 * @zh 敌人 AI 系统（共享）
 * @en Enemy AI System (shared)
 *
 * @zh 服务器和客户端共用的敌人 AI 逻辑
 * @en Shared enemy AI logic for both server and client
 */

import { EntitySystem, Entity, Matcher, Time, ECSSystem } from '@esengine/ecs-framework';
import { EnemyComponent } from '../components/EnemyComponent.js';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { MAP_BOUNDS } from '../constants.js';

@ECSSystem('EnemyAISystem')
export class EnemyAISystem extends EntitySystem {
    constructor() {
        super(Matcher.all(EnemyComponent));
    }

    protected process(entities: readonly Entity[]): void {
        // 客户端跳过 - 只有服务端运行 AI 逻辑
        if (!this.scene!.isServer) return;

        const dt = Time.deltaTime;
        const players = this.scene!.queryAll(PlayerComponent).entities;

        for (const entity of entities) {
            const enemyComp = entity.getComponent(EnemyComponent);
            if (!enemyComp) continue;

            // 检查是否死亡 - @NetworkEntity 自动广播 despawn
            if (enemyComp.health <= 0) {
                entity.destroy();
                continue;
            }

            // 更新 AI - 追踪最近玩家
            this.updateChaseAI(enemyComp, players, dt);
        }
    }

    private updateChaseAI(enemyComp: EnemyComponent, players: readonly Entity[], dt: number): void {
        const nearest = this.findNearestPlayer(players, enemyComp.x, enemyComp.y);
        if (!nearest) return;

        const playerComp = nearest.getComponent(PlayerComponent);
        if (!playerComp) return;

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
        } else {
            enemyComp.vx = 0;
            enemyComp.vy = 0;
        }
    }

    private findNearestPlayer(players: readonly Entity[], x: number, y: number): Entity | null {
        let nearest: Entity | null = null;
        let nearestDistSq = Infinity;

        for (const player of players) {
            const comp = player.getComponent(PlayerComponent);
            if (!comp) continue;

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
}
