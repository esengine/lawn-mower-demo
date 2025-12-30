import { EntitySystem, Matcher, Time, Entity, ECSSystem } from '@esengine/ecs-framework';
import { Transform, Weapon, Renderable, Projectile, ColliderComponent, Health, NetworkPlayer } from '../components';
import { RenderSystem } from './RenderSystem';
import { Color, Vec2, Vec3 } from 'cc';
import { EntityTags } from '../EntityTags';
import { networkService } from '../../network';

/**
 * 武器系统 - 处理自动攻击和子弹生成
 *
 * 网络模式下：
 * - 只为本地玩家创建子弹并发送射击事件到服务器
 * - 远程玩家的子弹由 ECSManager.handleRemoteShoot 创建
 */
@ECSSystem('WeaponSystem')
export class WeaponSystem extends EntitySystem {
    private gameContainer: any = null;

    constructor() {
        super(Matcher.all(Transform, Weapon));
    }

    public setGameContainer(container: any): void {
        this.gameContainer = container;
    }
    
    /**
     * 处理所有匹配的实体
     */
    protected process(entities: Entity[]): void {
        const deltaTime = Time.deltaTime;

        for (const entity of entities) {
            const weapon = entity.getComponent(Weapon);
            const transform = entity.getComponent(Transform);
            const networkPlayer = entity.getComponent(NetworkPlayer);

            if (!weapon || !transform) continue;

            // 网络模式：只处理本地玩家的武器
            // 远程玩家的射击由服务器广播，ECSManager.handleRemoteShoot 处理
            if (networkPlayer && !networkPlayer.isLocalPlayer) {
                continue;
            }

            weapon.updateTimer(deltaTime);

            if (weapon.autoFire && weapon.canFire()) {
                const target = this.findNearestTarget(new Vec2(transform.position.x, transform.position.y));
                if (target) {
                    const position = new Vec2(transform.position.x, transform.position.y);
                    const direction = target.clone().subtract(position).normalize();
                    const angle = Math.atan2(direction.y, direction.x);

                    // 本地创建子弹
                    this.createProjectile(position, direction, weapon);
                    weapon.resetFireTimer();

                    // 发送射击事件到服务器（服务器会广播给其他玩家）
                    if (networkService.isConnected) {
                        networkService.sendShoot(target.x, target.y);
                    }
                }
            }
        }
    }
    
    private findNearestTarget(position: Vec2): Vec2 | null {
        const enemyEntities = this.scene.findEntitiesByTag(EntityTags.ENEMY);
        let nearestTarget: Vec2 | null = null;
        let nearestDistance = Infinity;
        
        for (const entity of enemyEntities) {
            const transform = entity.getComponent(Transform);
            if (transform) {
                const targetPos = new Vec2(transform.position.x, transform.position.y);
                const distance = Vec2.distance(position, targetPos);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTarget = targetPos;
                }
            }
        }
        
        return nearestTarget;
    }
    
    /**
     * 创建子弹
     */
    private createProjectile(position: Vec2, direction: Vec2, weapon: Weapon): void {
        const projectile = this.scene.createEntity("Bullet");
        projectile.tag = EntityTags.BULLET;
        
        const transform = new Transform(position.x, position.y, 0);
        transform.rotation = Math.atan2(direction.y, direction.x);
        projectile.addComponent(transform);
        
        const projectileComponent = new Projectile(weapon.damage, weapon.bulletSpeed, weapon.bulletLifeTime);
        projectileComponent.setDirection(direction);
        projectile.addComponent(projectileComponent);
        
        const renderable = RenderSystem.createBullet();
        projectile.addComponent(renderable);
        
        const collider = new ColliderComponent('circle');
        collider.setSize(weapon.bulletSize);
        projectile.addComponent(collider);
    }
} 