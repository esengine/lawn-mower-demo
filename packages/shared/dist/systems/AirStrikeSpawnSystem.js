/**
 * @zh 空袭生成系统（共享）
 * @en AirStrike Spawn System (shared)
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PassiveSystem, ECSSystem } from '@esengine/ecs-framework';
import { AIRSTRIKE_COUNT, AIRSTRIKE_RADIUS, AIRSTRIKE_WARNING_TIME, AIRSTRIKE_EXPLOSION_RADIUS, AIRSTRIKE_EXPLOSION_DAMAGE, } from '../constants.js';
/**
 * @zh 空袭生成系统
 * @en AirStrike Spawn System
 *
 * @zh 空袭是瞬时事件，通过消息广播同步，不使用 ECS 实体
 * @en Air strikes are instant events, synced via message broadcast, not ECS entities
 */
let AirStrikeSpawnSystem = class AirStrikeSpawnSystem extends PassiveSystem {
    constructor() {
        super(...arguments);
        this.onBroadcastHandler = null;
    }
    /**
     * @zh 设置广播处理器（服务端使用）
     * @en Set broadcast handler (server-side)
     */
    onBroadcast(handler) {
        this.onBroadcastHandler = handler;
        return this;
    }
    /**
     * @zh 触发空袭
     * @en Trigger air strike
     *
     * @param centerX - @zh 中心 X 坐标 @en Center X coordinate
     * @param centerY - @zh 中心 Y 坐标 @en Center Y coordinate
     */
    triggerAirStrike(centerX, centerY) {
        // 生成目标位置
        const targets = [];
        for (let i = 0; i < AIRSTRIKE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * AIRSTRIKE_RADIUS;
            targets.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
            });
        }
        // 构建空袭事件
        const event = {
            targets,
            warningTime: AIRSTRIKE_WARNING_TIME,
            explosionRadius: AIRSTRIKE_EXPLOSION_RADIUS,
            explosionDamage: AIRSTRIKE_EXPLOSION_DAMAGE,
        };
        // 触发广播（服务端广播给所有客户端）
        this.onBroadcastHandler?.(event);
    }
};
AirStrikeSpawnSystem = __decorate([
    ECSSystem('AirStrikeSpawnSystem')
], AirStrikeSpawnSystem);
export { AirStrikeSpawnSystem };
//# sourceMappingURL=AirStrikeSpawnSystem.js.map