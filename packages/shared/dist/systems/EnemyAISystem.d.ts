/**
 * @zh 敌人 AI 系统（共享）
 * @en Enemy AI System (shared)
 *
 * @zh 服务器和客户端共用的敌人 AI 逻辑
 * @en Shared enemy AI logic for both server and client
 */
import { EntitySystem, Entity } from '@esengine/ecs-framework';
export declare class EnemyAISystem extends EntitySystem {
    constructor();
    protected process(entities: readonly Entity[]): void;
    private updateChaseAI;
    private findNearestPlayer;
}
//# sourceMappingURL=EnemyAISystem.d.ts.map