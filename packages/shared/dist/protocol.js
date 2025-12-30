/**
 * @zh 网络协议定义
 * @en Network Protocol Definitions
 *
 * @zh 定义客户端和服务端之间的消息类型
 * @en Defines message types between client and server
 */
// =============================================================================
// Message Types | 消息类型
// =============================================================================
/**
 * @zh 消息类型常量（客户端 -> 服务端）
 * @en Message type constants (Client -> Server)
 */
export const MsgTypes = {
    /** @zh 加入游戏 @en Join game */
    JoinGame: 'JoinGame',
    /** @zh 输入 @en Input */
    Input: 'Input',
    /** @zh 射击 @en Shoot */
    Shoot: 'Shoot',
    /** @zh 收集物品 @en Collect item */
    Collect: 'Collect',
};
/**
 * @zh 服务端广播事件类型
 * @en Server broadcast event types
 */
export const ServerEvents = {
    /** @zh 射击事件 @en Shoot event */
    Shoot: 'Shoot',
    /** @zh 空袭事件 @en Air strike event */
    AirStrike: 'AirStrike',
    /** @zh 玩家死亡 @en Player death */
    PlayerDeath: 'PlayerDeath',
};
//# sourceMappingURL=protocol.js.map