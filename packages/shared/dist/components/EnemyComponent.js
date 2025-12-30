/**
 * @zh 敌人组件 - 服务端/客户端共用
 * @en Enemy Component - Shared between server and client
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
import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';
/**
 * @zh 敌人类型
 * @en Enemy type
 */
export var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["RedChaser"] = 0] = "RedChaser";
    EnemyType[EnemyType["FastRunner"] = 1] = "FastRunner";
    EnemyType[EnemyType["Tank"] = 2] = "Tank";
})(EnemyType || (EnemyType = {}));
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
let EnemyComponent = class EnemyComponent extends Component {
    constructor() {
        // =========================================================================
        // Transform | 变换
        // =========================================================================
        super(...arguments);
        /**
         * @zh X坐标
         * @en X position
         */
        this.x = 0;
        /**
         * @zh Y坐标
         * @en Y position
         */
        this.y = 0;
        /**
         * @zh 旋转角度（弧度）
         * @en Rotation angle (radians)
         */
        this.rotation = 0;
        // =========================================================================
        // Velocity | 速度
        // =========================================================================
        /**
         * @zh X轴速度
         * @en X velocity
         */
        this.vx = 0;
        /**
         * @zh Y轴速度
         * @en Y velocity
         */
        this.vy = 0;
        // =========================================================================
        // Game State | 游戏状态
        // =========================================================================
        /**
         * @zh 生命值
         * @en Health points
         */
        this.health = 25;
        /**
         * @zh 移动速度
         * @en Movement speed
         */
        this.speed = 60;
        /**
         * @zh 敌人类型
         * @en Enemy type
         */
        this.enemyType = EnemyType.RedChaser;
        /**
         * @zh 目标玩家 ID
         * @en Target player ID
         */
        this.targetPlayerId = '';
    }
};
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "x", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "y", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "rotation", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "vx", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "vy", void 0);
__decorate([
    sync('uint16'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "health", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "speed", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], EnemyComponent.prototype, "enemyType", void 0);
__decorate([
    sync('string'),
    __metadata("design:type", String)
], EnemyComponent.prototype, "targetPlayerId", void 0);
EnemyComponent = __decorate([
    ECSComponent('EnemyComponent'),
    NetworkEntity('Enemy')
], EnemyComponent);
export { EnemyComponent };
//# sourceMappingURL=EnemyComponent.js.map