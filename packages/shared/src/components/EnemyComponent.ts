/**
 * @zh 敌人组件 - 服务端/客户端共用
 * @en Enemy Component - Shared between server and client
 */

import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

/**
 * @zh 敌人类型
 * @en Enemy type
 */
export enum EnemyType {
    RedChaser = 0,
    FastRunner = 1,
    Tank = 2,
}

/**
 * @zh 网络敌人组件
 * @en Network Enemy Component
 *
 * @zh 使用 @sync 装饰器标记需要网络同步的字段
 * @en Uses @sync decorator to mark fields that need network synchronization
 *
 * @zh 使用 @NetworkEntity 装饰器自动广播生成/销毁
 * @en Uses @NetworkEntity decorator for automatic spawn/despawn broadcasting
 */
@ECSComponent('EnemyComponent')
@NetworkEntity('Enemy')
export class EnemyComponent extends Component {
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
    @sync('uint16') health: number = 25;

    /**
     * @zh 移动速度
     * @en Movement speed
     */
    @sync('uint8') speed: number = 60;

    /**
     * @zh 敌人类型
     * @en Enemy type
     */
    @sync('uint8') enemyType: EnemyType = EnemyType.RedChaser;

    /**
     * @zh 目标玩家 ID
     * @en Target player ID
     */
    @sync('string') targetPlayerId: string = '';
}
