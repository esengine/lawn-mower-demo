/**
 * @zh 玩家组件 - 服务端/客户端共用
 * @en Player Component - Shared between server and client
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
let PlayerComponent = class PlayerComponent extends Component {
    constructor() {
        // =========================================================================
        // Identity | 身份信息
        // =========================================================================
        super(...arguments);
        /**
         * @zh 玩家唯一ID
         * @en Player unique ID
         */
        this.playerId = '';
        /**
         * @zh 玩家显示名称
         * @en Player display name
         */
        this.playerName = '';
        // =========================================================================
        // Transform | 变换
        // =========================================================================
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
        this.health = 100;
        /**
         * @zh 分数
         * @en Score
         */
        this.score = 0;
        /**
         * @zh 击杀数
         * @en Kill count
         */
        this.kills = 0;
        /**
         * @zh 死亡数
         * @en Death count
         */
        this.deaths = 0;
        /**
         * @zh 是否准备就绪
         * @en Is ready
         */
        this.isReady = false;
        // =========================================================================
        // Local State (Not Synced) | 本地状态（不同步）
        // =========================================================================
        /**
         * @zh 是否是本地玩家（仅客户端使用）
         * @en Is local player (client only)
         */
        this.isLocal = false;
        /**
         * @zh 上次输入时间戳
         * @en Last input timestamp
         */
        this.lastInputTime = 0;
    }
};
__decorate([
    sync('string'),
    __metadata("design:type", String)
], PlayerComponent.prototype, "playerId", void 0);
__decorate([
    sync('string'),
    __metadata("design:type", String)
], PlayerComponent.prototype, "playerName", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "x", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "y", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "rotation", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "vx", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "vy", void 0);
__decorate([
    sync('uint16'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "health", void 0);
__decorate([
    sync('uint16'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "score", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "kills", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], PlayerComponent.prototype, "deaths", void 0);
__decorate([
    sync('boolean'),
    __metadata("design:type", Boolean)
], PlayerComponent.prototype, "isReady", void 0);
PlayerComponent = __decorate([
    ECSComponent('PlayerComponent'),
    NetworkEntity('Player')
], PlayerComponent);
export { PlayerComponent };
//# sourceMappingURL=PlayerComponent.js.map