/**
 * @zh 玩家移动系统（共享）
 * @en Player Movement System (shared)
 *
 * @zh 服务器和客户端共用的玩家移动逻辑
 * @en Shared player movement logic for both server and client
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
import { EntitySystem, Matcher, Time, ECSSystem } from '@esengine/ecs-framework';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { MAP_BOUNDS } from '../constants.js';
let PlayerMovementSystem = class PlayerMovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(PlayerComponent));
    }
    process(entities) {
        const dt = Time.deltaTime;
        for (const entity of entities) {
            const comp = entity.getComponent(PlayerComponent);
            if (!comp)
                continue;
            // 应用速度
            comp.x += comp.vx * dt;
            comp.y += comp.vy * dt;
            // 边界检查
            comp.x = Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, comp.x));
            comp.y = Math.max(MAP_BOUNDS.minY, Math.min(MAP_BOUNDS.maxY, comp.y));
        }
    }
};
PlayerMovementSystem = __decorate([
    ECSSystem('PlayerMovementSystem'),
    __metadata("design:paramtypes", [])
], PlayerMovementSystem);
export { PlayerMovementSystem };
//# sourceMappingURL=PlayerMovementSystem.js.map