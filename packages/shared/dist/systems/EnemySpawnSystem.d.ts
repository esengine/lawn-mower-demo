/**
 * @zh 敌人生成系统（共享）
 * @en Enemy Spawn System (shared)
 *
 * @zh 服务器和客户端共用的敌人生成逻辑
 * @en Shared enemy spawn logic for both server and client
 */
import { Entity, EntitySystem } from '@esengine/ecs-framework';
export declare class EnemySpawnSystem extends EntitySystem {
    private spawnTimer;
    constructor();
    protected process(players: readonly Entity[]): void;
    private spawnEnemy;
}
//# sourceMappingURL=EnemySpawnSystem.d.ts.map