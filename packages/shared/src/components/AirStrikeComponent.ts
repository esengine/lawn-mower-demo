/**
 * @zh 空袭组件（仅客户端使用，用于本地动画）
 * @en AirStrike Component (client-only, for local animation)
 *
 * @zh 空袭通过 ServerEvents.AirStrike 消息同步，不使用 ECS 实体同步
 * @en Air strikes sync via ServerEvents.AirStrike message, not ECS entity sync
 */

import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

@ECSComponent('AirStrikeComponent')
export class AirStrikeComponent extends Component {
    /**
     * @zh 目标数量
     * @en Number of targets
     */
    @sync('uint8') targetCount: number = 0;

    /**
     * @zh 目标 X 坐标数组（使用 float32 数组编码为字符串）
     * @en Target X coordinates (encoded as comma-separated string)
     */
    @sync('string') targetXList: string = '';

    /**
     * @zh 目标 Y 坐标数组
     * @en Target Y coordinates
     */
    @sync('string') targetYList: string = '';

    /**
     * @zh 警告时间（秒）
     * @en Warning time in seconds
     */
    @sync('float32') warningTime: number = 2.0;

    /**
     * @zh 爆炸半径
     * @en Explosion radius
     */
    @sync('float32') explosionRadius: number = 80;

    /**
     * @zh 爆炸伤害
     * @en Explosion damage
     */
    @sync('uint16') explosionDamage: number = 100;

    /**
     * @zh 设置目标位置
     * @en Set target positions
     */
    setTargets(positions: Array<{ x: number; y: number }>): void {
        this.targetCount = positions.length;
        this.targetXList = positions.map(p => p.x.toFixed(1)).join(',');
        this.targetYList = positions.map(p => p.y.toFixed(1)).join(',');
    }

    /**
     * @zh 获取目标位置
     * @en Get target positions
     */
    getTargets(): Array<{ x: number; y: number }> {
        if (this.targetCount === 0 || !this.targetXList || !this.targetYList) {
            return [];
        }

        const xList = this.targetXList.split(',').map(Number);
        const yList = this.targetYList.split(',').map(Number);
        const targets: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < this.targetCount; i++) {
            targets.push({ x: xList[i] || 0, y: yList[i] || 0 });
        }

        return targets;
    }
}
