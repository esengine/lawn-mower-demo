/**
 * @zh 网络协议定义
 * @en Network Protocol Definitions
 *
 * @zh 定义客户端和服务端之间的消息类型
 * @en Defines message types between client and server
 */
/**
 * @zh 消息类型常量（客户端 -> 服务端）
 * @en Message type constants (Client -> Server)
 */
export declare const MsgTypes: {
    /** @zh 加入游戏 @en Join game */
    readonly JoinGame: "JoinGame";
    /** @zh 输入 @en Input */
    readonly Input: "Input";
    /** @zh 射击 @en Shoot */
    readonly Shoot: "Shoot";
    /** @zh 收集物品 @en Collect item */
    readonly Collect: "Collect";
};
/**
 * @zh 服务端广播事件类型
 * @en Server broadcast event types
 */
export declare const ServerEvents: {
    /** @zh 射击事件 @en Shoot event */
    readonly Shoot: "Shoot";
    /** @zh 空袭事件 @en Air strike event */
    readonly AirStrike: "AirStrike";
    /** @zh 玩家死亡 @en Player death */
    readonly PlayerDeath: "PlayerDeath";
};
export type MsgType = typeof MsgTypes[keyof typeof MsgTypes];
/**
 * @zh 加入游戏消息
 * @en Join game message
 */
export interface JoinGameMsg {
    /** @zh 玩家名称 @en Player name */
    playerName: string;
}
/**
 * @zh 输入消息
 * @en Input message
 */
export interface InputMsg {
    /** @zh X轴输入 (-1 到 1) @en X axis input (-1 to 1) */
    dx: number;
    /** @zh Y轴输入 (-1 到 1) @en Y axis input (-1 to 1) */
    dy: number;
    /** @zh 是否射击 @en Whether shooting */
    shoot: boolean;
    /** @zh 输入序列号（用于客户端预测） @en Input sequence (for client prediction) */
    seq: number;
}
/**
 * @zh 射击消息
 * @en Shoot message
 */
export interface ShootMsg {
    /** @zh 目标X坐标 @en Target X coordinate */
    targetX: number;
    /** @zh 目标Y坐标 @en Target Y coordinate */
    targetY: number;
}
/**
 * @zh 射击事件（广播）
 * @en Shoot event (broadcast)
 */
export interface ShootEvent {
    /** @zh 射击者ID @en Shooter ID */
    playerId: string;
    /** @zh 起始X @en Start X */
    x: number;
    /** @zh 起始Y @en Start Y */
    y: number;
    /** @zh 角度 @en Angle */
    angle: number;
    /** @zh 时间戳 @en Timestamp */
    timestamp: number;
}
/**
 * @zh 空袭事件（广播）
 * @en Air strike event (broadcast)
 */
export interface AirStrikeEvent {
    /** @zh 目标位置列表 @en Target positions */
    targets: Array<{
        x: number;
        y: number;
    }>;
    /** @zh 警告时间 @en Warning time */
    warningTime: number;
    /** @zh 爆炸半径 @en Explosion radius */
    explosionRadius: number;
    /** @zh 爆炸伤害 @en Explosion damage */
    explosionDamage: number;
}
/**
 * @zh 收集物品事件（广播）
 * @en Collect item event (broadcast)
 */
export interface CollectEvent {
    /** @zh 收集者ID @en Collector ID */
    playerId: string;
    /** @zh 收集物类型 @en Collectible type */
    collectibleType: number;
    /** @zh 收集物数值 @en Collectible value */
    value: number;
}
/**
 * @zh 玩家死亡事件
 * @en Player death event
 */
export interface PlayerDeathEvent {
    /** @zh 死亡玩家ID @en Dead player ID */
    playerId: string;
    /** @zh 击杀者ID @en Killer ID */
    killerId: string;
}
//# sourceMappingURL=protocol.d.ts.map