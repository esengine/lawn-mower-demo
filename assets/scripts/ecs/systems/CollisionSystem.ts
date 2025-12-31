import { EntitySystem, Entity, Matcher, Time, ECSSystem } from '@esengine/ecs-framework';
import { Transform, ColliderComponent, Health, ParticleEffect, DamageCooldown, Projectile, ProjectileType } from '../components';
import { PhysicsWorld, CollisionPair } from '../PhysicsWorld';
import { EntityTags } from '../EntityTags';
import { Vec2 } from 'cc';
import { networkService } from '../../network';

@ECSSystem('CollisionSystem')
export class CollisionSystem extends EntitySystem {
    private physicsWorld: PhysicsWorld;
    
    constructor() {
        super(Matcher.all(Transform, ColliderComponent));
        this.physicsWorld = new PhysicsWorld();
    }
    
    protected onInitialize(): void {
        this.addEventListener('grenade:explode', this.onGrenadeExplode.bind(this));
    }
    
    private onGrenadeExplode(data: { x: number, y: number, projectile: Projectile }): void {
        this.handleGrenadeExplosion(data.x, data.y, data.projectile);
    }
    
    protected process(entities: Entity[]): void {
        const collisionPairs = this.physicsWorld.detectCollisions(entities);
        
        for (const pair of collisionPairs) {
            this.handleCollision(pair);
        }
    }
    
    private handleCollision(pair: CollisionPair): void {
        const entity1 = pair.entity1;
        const entity2 = pair.entity2;
        
        if (entity1.tag === EntityTags.BULLET && entity2.tag === EntityTags.ENEMY) {
            this.handleBulletEnemyCollision(entity1, entity2);
        } else if (entity1.tag === EntityTags.ENEMY && entity2.tag === EntityTags.BULLET) {
            this.handleBulletEnemyCollision(entity2, entity1);
        } else if (entity1.tag === EntityTags.PLAYER && entity2.tag === EntityTags.ENEMY) {
            this.handlePlayerEnemyCollision(entity1, entity2);
        } else if (entity1.tag === EntityTags.ENEMY && entity2.tag === EntityTags.PLAYER) {
            this.handlePlayerEnemyCollision(entity2, entity1);
        }
    }
    
    private handleBulletEnemyCollision(bullet: Entity, enemy: Entity): void {
        const enemyHealth = enemy.getComponent(Health);
        const bulletTransform = bullet.getComponent(Transform);
        const projectile = bullet.getComponent(Projectile);

        if (enemyHealth && bulletTransform && projectile) {
            if (projectile.type === ProjectileType.GRENADE) {
                this.handleGrenadeExplosion(bulletTransform.position.x, bulletTransform.position.y, projectile);
            } else {
                const damage = 30;
                enemyHealth.takeDamage(damage);

                // 通知服务器敌人受击
                networkService.sendEnemyHit(enemy, damage);

                if (enemyHealth.current <= 0) {
                    this.createDeathParticles(bulletTransform.position.x, bulletTransform.position.y);
                    enemy.destroy();
                }
            }
        }

        bullet.destroy();
    }
    
    private handlePlayerEnemyCollision(player: Entity, enemy: Entity): void {
        const playerHealth = player.getComponent(Health);
        const damageCooldown = enemy.getComponent(DamageCooldown);
        
        if (!playerHealth || !damageCooldown) return;
        
        const currentTime = Time.totalTime;
        
        if (damageCooldown.canDealDamage(currentTime)) {
            playerHealth.takeDamage(1);
            damageCooldown.dealDamage(currentTime);
            
            if (playerHealth.current <= 0) {
                this.scene.eventSystem.emit('camera:shake', { type: 'explosion' });
                const playerTransform = player.getComponent(Transform);
                if (playerTransform) {
                    this.createDeathParticles(playerTransform.position.x, playerTransform.position.y);
                }
                player.destroy();
            } else {
                this.scene.eventSystem.emit('camera:shake', { type: 'medium' });
            }
        }
    }
    
    private createDeathParticles(x: number, y: number): void {
        const particleEntity = this.scene.createEntity("DeathParticles");
        const transform = new Transform(x, y, 0);
        const particles = ParticleEffect.createDeathExplosion();
        
        particleEntity.addComponent(transform);
        particleEntity.addComponent(particles);
        
        particles.emitterPosition.set(x, y);
        particles.burst(15);
    }
    
    private handleGrenadeExplosion(x: number, y: number, projectile: Projectile): void {
        this.scene.eventSystem.emit('camera:shake', { type: 'strong' });

        const explosionCenter = new Vec2(x, y);
        const enemyEntities = this.scene.findEntitiesByTag(EntityTags.ENEMY);

        for (const enemy of enemyEntities) {
            const enemyTransform = enemy.getComponent(Transform);
            const enemyHealth = enemy.getComponent(Health);

            if (enemyTransform && enemyHealth) {
                const enemyPos = new Vec2(enemyTransform.position.x, enemyTransform.position.y);
                const distance = Vec2.distance(explosionCenter, enemyPos);

                if (distance <= projectile.explosionRadius) {
                    const damageRatio = 1 - (distance / projectile.explosionRadius);
                    const damage = Math.floor(projectile.explosionDamage * damageRatio);

                    enemyHealth.takeDamage(damage);

                    // 通知服务器敌人受击
                    networkService.sendEnemyHit(enemy, damage);

                    if (enemyHealth.current <= 0) {
                        this.createDeathParticles(enemyTransform.position.x, enemyTransform.position.y);
                        enemy.destroy();
                    }
                }
            }
        }

        this.createDeathParticles(x, y);
    }
}