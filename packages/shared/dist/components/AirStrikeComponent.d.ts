/**
 * @zh 空袭组件（仅客户端使用，用于本地动画）
 * @en AirStrike Component (client-only, for local animation)
 *
 * @zh 空袭通过 ServerEvents.AirStrike 消息同步，不使用 ECS 实体同步
 * @en Air strikes sync via ServerEvents.AirStrike message, not ECS entity sync
 */
import { Component } from '@esengine/ecs-framework';
export declare class AirStrikeComponent extends Component {
    /**
     * @zh 目标数量
     * @en Number of targets
     */
    targetCount: number;
    /**
     * @zh 目标 X 坐标数组（使用 float32 数组编码为字符串）
     * @en Target X coordinates (encoded as comma-separated string)
     */
    targetXList: string;
    /**
     * @zh 目标 Y 坐标数组
     * @en Target Y coordinates
     */
    targetYList: string;
    /**
     * @zh 警告时间（秒）
     * @en Warning time in seconds
     */
    warningTime: number;
    /**
     * @zh 爆炸半径
     * @en Explosion radius
     */
    explosionRadius: number;
    /**
     * @zh 爆炸伤害
     * @en Explosion damage
     */
    explosionDamage: number;
    /**
     * @zh 设置目标位置
     * @en Set target positions
     */
    setTargets(positions: Array<{
        x: number;
        y: number;
    }>): void;
    /**
     * @zh 获取目标位置
     * @en Get target positions
     */
    getTargets(): Array<{
        x: number;
        y: number;
    }>;
}
//# sourceMappingURL=AirStrikeComponent.d.ts.map