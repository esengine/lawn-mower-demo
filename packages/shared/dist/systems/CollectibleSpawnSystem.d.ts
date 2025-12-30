/**
 * @zh 收集物生成系统（共享）
 * @en Collectible Spawn System (shared)
 */
import { EntitySystem, Entity } from '@esengine/ecs-framework';
/**
 * @zh 收集物收集事件处理器
 * @en Collectible collect event handler
 */
export type CollectibleCollectHandler = (collectible: Entity, player: Entity) => void;
export declare class CollectibleSpawnSystem extends EntitySystem {
    private spawnTimer;
    private onCollectHandler;
    constructor();
    /**
     * @zh 设置收集物收集处理器
     * @en Set collectible collect handler
     */
    onCollect(handler: CollectibleCollectHandler): this;
    protected process(players: readonly Entity[]): void;
    private spawnCollectible;
    /**
     * @zh 检查玩家收集
     * @en Check player collections
     */
    private checkCollections;
}
//# sourceMappingURL=CollectibleSpawnSystem.d.ts.map