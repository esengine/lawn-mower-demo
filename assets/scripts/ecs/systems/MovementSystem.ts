import { EntitySystem, Matcher, Entity, Time, ECSSystem } from '@esengine/ecs-framework';
import { Transform, Movement, NetworkPlayer } from '../components';
import { Vec2 } from 'cc';

@ECSSystem('MovementSystem')
export class MovementSystem extends EntitySystem {
    private readonly tempVec2 = new Vec2();
    private readonly MOVEMENT_THRESHOLD = 0.1;
    private readonly ROTATION_THRESHOLD = 0.001;
    private ecsManager: any = null;
    
    constructor() {
        super(Matcher.all(Transform, Movement));
    }
    
    protected onInitialize(): void {
        // 获取ECS管理器引用
        if (this.scene && (this.scene as any).getECSManager) {
            this.ecsManager = (this.scene as any).getECSManager();
        }
    }
    
    protected process(entities: Entity[]): void {
        const deltaTime = Time.deltaTime;
        
        for (const entity of entities) {
            this.processEntityMovement(entity, deltaTime);
        }
    }
    
    private processEntityMovement(entity: Entity, deltaTime: number): void {
        const transform = entity.getComponent(Transform);
        const movement = entity.getComponent(Movement);
        const networkPlayer = entity.getComponent(NetworkPlayer);
        
        if (!transform || !movement) return;
        
        // 如果是网络玩家，使用不同的移动逻辑
        if (networkPlayer) {
            this.processNetworkPlayerMovement(entity, transform, movement, networkPlayer, deltaTime);
        } else {
            this.processLocalMovement(entity, transform, movement, deltaTime);
        }
    }
    
    /**
     * 处理本地玩家移动
     */
    private processLocalMovement(entity: Entity, transform: Transform, movement: Movement, deltaTime: number): void {
        const inputDirLen = movement.inputDirection.x * movement.inputDirection.x + 
                           movement.inputDirection.y * movement.inputDirection.y;
        
        if (inputDirLen > this.MOVEMENT_THRESHOLD * this.MOVEMENT_THRESHOLD) {
            const invLen = 1 / Math.sqrt(inputDirLen);
            const normalizedX = movement.inputDirection.x * invLen;
            const normalizedY = movement.inputDirection.y * invLen;
            
            const moveDistance = movement.maxSpeed * deltaTime;
            
            transform.previousPosition.set(transform.position);
            transform.position.x += normalizedX * moveDistance;
            transform.position.y += normalizedY * moveDistance;
            
            movement.velocity.set(normalizedX * movement.maxSpeed, normalizedY * movement.maxSpeed);
            
            const velocityLen = movement.velocity.x * movement.velocity.x + movement.velocity.y * movement.velocity.y;
            if (velocityLen > 100) {
                const targetRotation = Math.atan2(movement.velocity.y, movement.velocity.x);
                
                let angleDiff = targetRotation - transform.rotation;
                if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                else if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                if (Math.abs(angleDiff) > this.ROTATION_THRESHOLD) {
                    transform.rotation += angleDiff * 8 * deltaTime;
                }
            }
        } else {
            movement.velocity.set(0, 0);
        }
    }
    
    /**
     * 处理网络玩家移动
     */
    private processNetworkPlayerMovement(entity: Entity, transform: Transform, movement: Movement, networkPlayer: NetworkPlayer, deltaTime: number): void {
        if (networkPlayer.isLocalPlayer) {
            // 本地玩家：客户端预测 + 服务器校正
            this.processLocalPlayerWithPrediction(transform, movement, networkPlayer, deltaTime);
        } else {
            // 远程玩家：使用框架的 SnapshotBuffer 进行时间插值
            if (networkPlayer.enableInterpolation) {
                const interpolated = networkPlayer.getBufferedInterpolation();

                if (interpolated) {
                    // 使用框架插值后的位置
                    transform.previousPosition.set(transform.position);
                    transform.position.set(interpolated.position.x, interpolated.position.y);
                    transform.rotation = interpolated.rotation;
                    movement.velocity.set(interpolated.velocity.x, interpolated.velocity.y);
                } else {
                    // 没有插值数据，使用旧版线性插值作为回退
                    const currentPos = { x: transform.position.x, y: transform.position.y };
                    const targetPosition = networkPlayer.getInterpolatedPosition(currentPos, deltaTime);

                    transform.previousPosition.set(transform.position);
                    transform.position.set(targetPosition.x, targetPosition.y);

                    const dx = transform.position.x - transform.previousPosition.x;
                    const dy = transform.position.y - transform.previousPosition.y;
                    movement.velocity.set(dx / deltaTime, dy / deltaTime);

                    if (movement.velocity.lengthSqr() > 100) {
                        const targetRotation = Math.atan2(movement.velocity.y, movement.velocity.x);
                        let angleDiff = targetRotation - transform.rotation;
                        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                        else if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                        if (Math.abs(angleDiff) > this.ROTATION_THRESHOLD) {
                            transform.rotation += angleDiff * 8 * deltaTime;
                        }
                    }
                }
            } else {
                // 直接设置位置
                transform.previousPosition.set(transform.position);
                transform.position.set(networkPlayer.networkPosition.x, networkPlayer.networkPosition.y);
                transform.rotation = networkPlayer.networkRotation;
                movement.velocity.set(networkPlayer.networkVelocity.x, networkPlayer.networkVelocity.y);
            }
        }
    }
    
    /**
     * @zh 处理本地玩家移动（带预测）
     * @en Process local player movement with prediction
     */
    private processLocalPlayerWithPrediction(transform: Transform, movement: Movement, networkPlayer: NetworkPlayer, deltaTime: number): void {
        const inputDirLen = movement.inputDirection.x * movement.inputDirection.x +
                           movement.inputDirection.y * movement.inputDirection.y;

        // 1. 应用服务器校正（平滑）
        if (networkPlayer.pendingCorrection.x !== 0 || networkPlayer.pendingCorrection.y !== 0) {
            const correction = networkPlayer.applySmoothCorrection(deltaTime);
            transform.position.x += correction.x;
            transform.position.y += correction.y;
        }

        // 2. 客户端预测移动
        if (inputDirLen > this.MOVEMENT_THRESHOLD * this.MOVEMENT_THRESHOLD) {
            const invLen = 1 / Math.sqrt(inputDirLen);
            const normalizedX = movement.inputDirection.x * invLen;
            const normalizedY = movement.inputDirection.y * invLen;

            const moveDistance = movement.maxSpeed * deltaTime;

            transform.previousPosition.set(transform.position);
            transform.position.x += normalizedX * moveDistance;
            transform.position.y += normalizedY * moveDistance;

            movement.velocity.set(normalizedX * movement.maxSpeed, normalizedY * movement.maxSpeed);

            // 更新旋转
            const velocityLen = movement.velocity.x * movement.velocity.x + movement.velocity.y * movement.velocity.y;
            if (velocityLen > 100) {
                const targetRotation = Math.atan2(movement.velocity.y, movement.velocity.x);

                let angleDiff = targetRotation - transform.rotation;
                if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                else if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                if (Math.abs(angleDiff) > this.ROTATION_THRESHOLD) {
                    transform.rotation += angleDiff * 8 * deltaTime;
                }
            }
        } else {
            movement.velocity.set(0, 0);
        }
    }
} 