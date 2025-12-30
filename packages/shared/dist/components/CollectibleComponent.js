/**
 * @zh 收集物组件 - 服务端/客户端共用
 * @en Collectible Component - Shared between server and client
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
 * @zh 收集物类型
 * @en Collectible type
 */
export var CollectibleType;
(function (CollectibleType) {
    CollectibleType[CollectibleType["AirStrike"] = 0] = "AirStrike";
    CollectibleType[CollectibleType["HealthPack"] = 1] = "HealthPack";
    CollectibleType[CollectibleType["SpeedBoost"] = 2] = "SpeedBoost";
    CollectibleType[CollectibleType["DamageBoost"] = 3] = "DamageBoost";
})(CollectibleType || (CollectibleType = {}));
/**
 * @zh 网络收集物组件
 * @en Network Collectible Component
 *
 * @zh 使用 @NetworkEntity 装饰器自动广播生成/销毁
 * @en Uses @NetworkEntity decorator for automatic spawn/despawn broadcasting
 */
let CollectibleComponent = class CollectibleComponent extends Component {
    constructor() {
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
         * @zh 收集物类型
         * @en Collectible type
         */
        this.collectibleType = CollectibleType.AirStrike;
        /**
         * @zh 数值（如治疗量、加成倍数等）
         * @en Value (healing amount, boost multiplier, etc.)
         */
        this.value = 1;
        /**
         * @zh 是否已被收集
         * @en Whether it has been collected
         */
        this.isCollected = 0;
    }
};
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], CollectibleComponent.prototype, "x", void 0);
__decorate([
    sync('float32'),
    __metadata("design:type", Number)
], CollectibleComponent.prototype, "y", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], CollectibleComponent.prototype, "collectibleType", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], CollectibleComponent.prototype, "value", void 0);
__decorate([
    sync('uint8'),
    __metadata("design:type", Number)
], CollectibleComponent.prototype, "isCollected", void 0);
CollectibleComponent = __decorate([
    ECSComponent('CollectibleComponent'),
    NetworkEntity('Collectible')
], CollectibleComponent);
export { CollectibleComponent };
//# sourceMappingURL=CollectibleComponent.js.map