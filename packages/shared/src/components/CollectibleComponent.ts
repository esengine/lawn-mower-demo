/**
 * @zh 收集物组件 - 服务端/客户端共用
 * @en Collectible Component - Shared between server and client
 */

import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

/**
 * @zh 收集物类型
 * @en Collectible type
 */
export enum CollectibleType {
    AirStrike = 0,
    HealthPack = 1,
    SpeedBoost = 2,
    DamageBoost = 3,
}

/**
 * @zh 网络收集物组件
 * @en Network Collectible Component
 *
 * @zh 使用 @NetworkEntity 装饰器自动广播生成/销毁
 * @en Uses @NetworkEntity decorator for automatic spawn/despawn broadcasting
 */
@ECSComponent('CollectibleComponent')
@NetworkEntity('Collectible')
export class CollectibleComponent extends Component {
    /**
     * @zh X坐标
     * @en X position
     */
    @sync('float32') x: number = 0;

    /**
     * @zh Y坐标
     * @en Y position
     */
    @sync('float32') y: number = 0;

    /**
     * @zh 收集物类型
     * @en Collectible type
     */
    @sync('uint8') collectibleType: CollectibleType = CollectibleType.AirStrike;

    /**
     * @zh 数值（如治疗量、加成倍数等）
     * @en Value (healing amount, boost multiplier, etc.)
     */
    @sync('uint8') value: number = 1;

    /**
     * @zh 是否已被收集
     * @en Whether it has been collected
     */
    @sync('uint8') isCollected: number = 0;
}
