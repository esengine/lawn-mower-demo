/**
 * @zh 玩家移动系统（共享）
 * @en Player Movement System (shared)
 *
 * @zh 服务器和客户端共用的玩家移动逻辑
 * @en Shared player movement logic for both server and client
 */
import { EntitySystem, Entity } from '@esengine/ecs-framework';
export declare class PlayerMovementSystem extends EntitySystem {
    constructor();
    protected process(entities: readonly Entity[]): void;
}
//# sourceMappingURL=PlayerMovementSystem.d.ts.map