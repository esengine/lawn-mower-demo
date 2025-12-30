/**
 * @zh 收集物组件 - 服务端/客户端共用
 * @en Collectible Component - Shared between server and client
 */
import { Component } from '@esengine/ecs-framework';
/**
 * @zh 收集物类型
 * @en Collectible type
 */
export declare enum CollectibleType {
    AirStrike = 0,
    HealthPack = 1,
    SpeedBoost = 2,
    DamageBoost = 3
}
/**
 * @zh 网络收集物组件
 * @en Network Collectible Component
 *
 * @zh 使用 @NetworkEntity 装饰器自动广播生成/销毁
 * @en Uses @NetworkEntity decorator for automatic spawn/despawn broadcasting
 */
export declare class CollectibleComponent extends Component {
    /**
     * @zh X坐标
     * @en X position
     */
    x: number;
    /**
     * @zh Y坐标
     * @en Y position
     */
    y: number;
    /**
     * @zh 收集物类型
     * @en Collectible type
     */
    collectibleType: CollectibleType;
    /**
     * @zh 数值（如治疗量、加成倍数等）
     * @en Value (healing amount, boost multiplier, etc.)
     */
    value: number;
    /**
     * @zh 是否已被收集
     * @en Whether it has been collected
     */
    isCollected: number;
}
//# sourceMappingURL=CollectibleComponent.d.ts.map