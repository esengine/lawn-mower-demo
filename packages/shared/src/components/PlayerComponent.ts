/**
 * @zh 玩家组件 - 服务端/客户端共用
 * @en Player Component - Shared between server and client
 */

import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

/**
 * @zh 网络玩家组件
 * @en Network Player Component
 *
 * @zh 使用 @sync 装饰器标记需要网络同步的字段
 * @en Uses @sync decorator to mark fields that need network synchronization
 *
 * @zh 使用 @NetworkEntity 装饰器标记需要自动广播生成/销毁的实体
 * @en Uses @NetworkEntity decorator to mark entities that need automatic spawn/despawn broadcasting
 *
 * @zh 注意：所有 Component 子类都必须添加 @ECSComponent 装饰器！
 * @en Note: All Component subclasses MUST have the @ECSComponent decorator!
 */
@ECSComponent('PlayerComponent')
@NetworkEntity('Player')
export class PlayerComponent extends Component {
    // =========================================================================
    // Identity | 身份信息
    // =========================================================================

    /**
     * @zh 玩家唯一ID
     * @en Player unique ID
     */
    @sync('string') playerId: string = '';

    /**
     * @zh 玩家显示名称
     * @en Player display name
     */
    @sync('string') playerName: string = '';

    // =========================================================================
    // Transform | 变换
    // =========================================================================

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
     * @zh 旋转角度（弧度）
     * @en Rotation angle (radians)
     */
    @sync('float32') rotation: number = 0;

    // =========================================================================
    // Velocity | 速度
    // =========================================================================

    /**
     * @zh X轴速度
     * @en X velocity
     */
    @sync('float32') vx: number = 0;

    /**
     * @zh Y轴速度
     * @en Y velocity
     */
    @sync('float32') vy: number = 0;

    // =========================================================================
    // Game State | 游戏状态
    // =========================================================================

    /**
     * @zh 生命值
     * @en Health points
     */
    @sync('uint16') health: number = 100;

    /**
     * @zh 分数
     * @en Score
     */
    @sync('uint16') score: number = 0;

    /**
     * @zh 击杀数
     * @en Kill count
     */
    @sync('uint8') kills: number = 0;

    /**
     * @zh 死亡数
     * @en Death count
     */
    @sync('uint8') deaths: number = 0;

    /**
     * @zh 是否准备就绪
     * @en Is ready
     */
    @sync('boolean') isReady: boolean = false;

    // =========================================================================
    // Local State (Not Synced) | 本地状态（不同步）
    // =========================================================================

    /**
     * @zh 是否是本地玩家（仅客户端使用）
     * @en Is local player (client only)
     */
    isLocal: boolean = false;

    /**
     * @zh 上次输入时间戳
     * @en Last input timestamp
     */
    lastInputTime: number = 0;
}
