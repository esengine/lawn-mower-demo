/**
 * @zh 敌人组件 - 服务端/客户端共用
 * @en Enemy Component - Shared between server and client
 */
import { Component } from '@esengine/ecs-framework';
/**
 * @zh 敌人类型
 * @en Enemy type
 */
export declare enum EnemyType {
    RedChaser = 0,
    FastRunner = 1,
    Tank = 2
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
export declare class EnemyComponent extends Component {
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
     * @zh 旋转角度（弧度）
     * @en Rotation angle (radians)
     */
    rotation: number;
    /**
     * @zh X轴速度
     * @en X velocity
     */
    vx: number;
    /**
     * @zh Y轴速度
     * @en Y velocity
     */
    vy: number;
    /**
     * @zh 生命值
     * @en Health points
     */
    health: number;
    /**
     * @zh 移动速度
     * @en Movement speed
     */
    speed: number;
    /**
     * @zh 敌人类型
     * @en Enemy type
     */
    enemyType: EnemyType;
    /**
     * @zh 目标玩家 ID
     * @en Target player ID
     */
    targetPlayerId: string;
}
//# sourceMappingURL=EnemyComponent.d.ts.map