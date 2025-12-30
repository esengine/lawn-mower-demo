/**
 * @zh 空袭组件（仅客户端使用，用于本地动画）
 * @en AirStrike Component (client-only, for local animation)
 *
 * @zh 空袭通过 ServerEvents.AirStrike 消息同步，不使用 ECS 实体同步
 * @en Air strikes sync via ServerEvents.AirStrike message, not ECS entity sync
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';
let AirStrikeComponent = class AirStrikeComponent extends Component {
    constructor() {
        super(...arguments);
        /**
         * @zh 目标数量
         * @en Number of targets
         */
        this.targetCount = 0;
        /**
         * @zh 目标 X 坐标数组（使用 float32 数组编码为字符串）
         * @en Target X coordinates (encoded as comma-separated string)
         */
        this.targetXList = '';
        /**
         * @zh 目标 Y 坐标数组
         * @en Target Y coordinates
         */
        this.targetYList = '';
        /**
         * @zh 警告时间（秒）
         * @en Warning time in seconds
         */
        this.warningTime = 2.0;
        /**
         * @zh 爆炸半径
         * @en Explosion radius
         */
        this.explosionRadius = 80;
        /**
         * @zh 爆炸伤害
         * @en Explosion damage
         */
        this.explosionDamage = 100;
    }
    /**
     * @zh 设置目标位置
     * @en Set target positions
     */
    setTargets(positions) {
        this.targetCount = positions.length;
        this.targetXList = positions.map(p => p.x.toFixed(1)).join(',');
        this.targetYList = positions.map(p => p.y.toFixed(1)).join(',');
    }
    /**
     * @zh 获取目标位置
     * @en Get target positions
     */
    getTargets() {
        if (this.targetCount === 0 || !this.targetXList || !this.targetYList) {
            return [];
        }
        const xList = this.targetXList.split(',').map(Number);
        const yList = this.targetYList.split(',').map(Number);
        const targets = [];
        for (let i = 0; i < this.targetCount; i++) {
            targets.push({ x: xList[i] || 0, y: yList[i] || 0 });
        }
        return targets;
    }
};
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], AirStrikeComponent.prototype, "targetCount", void 0);
__decorate([
    sync('string'),
    __metadata("design:type", String)
], AirStrikeComponent.prototype, "targetXList", void 0);
__decorate([
    sync('string'),
    __metadata("design:type", String)
], AirStrikeComponent.prototype, "targetYList", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], AirStrikeComponent.prototype, "warningTime", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], AirStrikeComponent.prototype, "explosionRadius", void 0);
__decorate([
    sync('uint16'),
    __metadata("design:type", Number)
], AirStrikeComponent.prototype, "explosionDamage", void 0);
AirStrikeComponent = __decorate([
    ECSComponent('AirStrikeComponent')
], AirStrikeComponent);
export { AirStrikeComponent };
//# sourceMappingURL=AirStrikeComponent.js.map