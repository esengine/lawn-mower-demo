/**
 * @zh 空袭生成系统（共享）
 * @en AirStrike Spawn System (shared)
 */
import { PassiveSystem } from '@esengine/ecs-framework';
import type { AirStrikeEvent } from '../protocol.js';
/**
 * @zh 空袭事件处理器
 * @en Air strike event handler
 */
export type AirStrikeBroadcastHandler = (event: AirStrikeEvent) => void;
/**
 * @zh 空袭生成系统
 * @en AirStrike Spawn System
 *
 * @zh 空袭是瞬时事件，通过消息广播同步，不使用 ECS 实体
 * @en Air strikes are instant events, synced via message broadcast, not ECS entities
 */
export declare class AirStrikeSpawnSystem extends PassiveSystem {
    private onBroadcastHandler;
    /**
     * @zh 设置广播处理器（服务端使用）
     * @en Set broadcast handler (server-side)
     */
    onBroadcast(handler: AirStrikeBroadcastHandler): this;
    /**
     * @zh 触发空袭
     * @en Trigger air strike
     *
     * @param centerX - @zh 中心 X 坐标 @en Center X coordinate
     * @param centerY - @zh 中心 Y 坐标 @en Center Y coordinate
     */
    triggerAirStrike(centerX: number, centerY: number): void;
}
//# sourceMappingURL=AirStrikeSpawnSystem.d.ts.map