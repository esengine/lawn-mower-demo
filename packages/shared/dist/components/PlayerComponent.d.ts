/**
 * @zh 玩家组件 - 服务端/客户端共用
 * @en Player Component - Shared between server and client
 */
import { Component } from '@esengine/ecs-framework';
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
export declare class PlayerComponent extends Component {
    /**
     * @zh 玩家唯一ID
     * @en Player unique ID
     */
    playerId: string;
    /**
     * @zh 玩家显示名称
     * @en Player display name
     */
    playerName: string;
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
     * @zh 分数
     * @en Score
     */
    score: number;
    /**
     * @zh 击杀数
     * @en Kill count
     */
    kills: number;
    /**
     * @zh 死亡数
     * @en Death count
     */
    deaths: number;
    /**
     * @zh 是否准备就绪
     * @en Is ready
     */
    isReady: boolean;
    /**
     * @zh 是否是本地玩家（仅客户端使用）
     * @en Is local player (client only)
     */
    isLocal: boolean;
    /**
     * @zh 上次输入时间戳
     * @en Last input timestamp
     */
    lastInputTime: number;
}
//# sourceMappingURL=PlayerComponent.d.ts.map