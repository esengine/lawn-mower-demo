/**
 * @zh 玩家移动系统（共享）
 * @en Player Movement System (shared)
 *
 * @zh 服务器和客户端共用的玩家移动逻辑
 * @en Shared player movement logic for both server and client
 */

import { EntitySystem, Entity, Matcher, Time, ECSSystem } from '@esengine/ecs-framework';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { MAP_BOUNDS } from '../constants.js';

@ECSSystem('PlayerMovementSystem')
export class PlayerMovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(PlayerComponent));
    }

    protected process(entities: readonly Entity[]): void {
        const dt = Time.deltaTime;

        for (const entity of entities) {
            const comp = entity.getComponent(PlayerComponent);
            if (!comp) continue;

            // 应用速度
            comp.x += comp.vx * dt;
            comp.y += comp.vy * dt;

            // 边界检查
            comp.x = Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, comp.x));
            comp.y = Math.max(MAP_BOUNDS.minY, Math.min(MAP_BOUNDS.maxY, comp.y));
        }
    }
}
