import { PassiveSystem, Time, Entity, ECSSystem } from '@esengine/ecs-framework';
import { Transform, ExplosionWarning, Health, ParticleEffect } from '../components';
import { RenderSystem } from './RenderSystem';
import { EntityTags } from '../EntityTags';
import { Vec2 } from 'cc';

@ECSSystem('AirStrikeSystem')
export class AirStrikeSystem extends PassiveSystem {
    private isActive: boolean = false;
    private strikeTargets: Vec2[] = [];
    private warningTime: number = 2.0;
    private currentWarningTime: number = 0;
    private warningEntities: Entity[] = [];
    private missileEntities: Entity[] = [];
    private missileTargets: Map<number, number> = new Map();
    private strikeCount: number = 10;
    private strikeRadius: number = 300;
    private missilesLaunched: boolean = false;
    
    protected onInitialize(): void {
        this.scene.eventSystem.on('airstrike:activate', this.activateAirStrike.bind(this));
    }
    
    public update(): void {
        if (!this.isActive) return;
        
        const deltaTime = Time.deltaTime;
        this.currentWarningTime += deltaTime;
        
        if (this.currentWarningTime >= this.warningTime && !this.missilesLaunched) {
            this.launchMissiles();
            this.missilesLaunched = true;
        }
        
        this.updateMissiles(deltaTime);
    }
    
    /**
     * @zh 激活空袭（支持服务器同步的目标位置）
     * @en Activate air strike (supports server-synced target positions)
     */
    private activateAirStrike(eventData?: {
        targets?: Array<{ x: number; y: number }>;
        warningTime?: number;
        explosionRadius?: number;
        explosionDamage?: number;
    }): void {
        if (this.isActive) return;

        this.isActive = true;
        this.currentWarningTime = 0;
        this.missilesLaunched = false;
        this.strikeTargets = [];
        this.warningEntities = [];

        // 使用服务器同步的参数（如果有）
        if (eventData?.warningTime) this.warningTime = eventData.warningTime;

        // 使用服务器同步的目标位置，或本地生成（单机模式）
        if (eventData?.targets && eventData.targets.length > 0) {
            // 网络模式：使用服务器提供的目标位置
            for (const target of eventData.targets) {
                const pos = new Vec2(target.x, target.y);
                this.strikeTargets.push(pos);
                this.createWarning(pos);
            }
        } else {
            // 单机模式：本地生成目标位置
            const playerEntities = this.scene.findEntitiesByTag(EntityTags.PLAYER);
            if (playerEntities.length === 0) return;

            const player = playerEntities[0];
            const playerTransform = player.getComponent(Transform);
            if (!playerTransform) return;

            const playerPos = new Vec2(playerTransform.position.x, playerTransform.position.y);

            for (let i = 0; i < this.strikeCount; i++) {
                const randomPos = this.getRandomPosition(playerPos);
                this.strikeTargets.push(randomPos);
                this.createWarning(randomPos);
            }
        }
    }
    
    private getRandomPosition(centerPos: Vec2): Vec2 {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.strikeRadius;
        
        const x = centerPos.x + Math.cos(angle) * distance;
        const y = centerPos.y + Math.sin(angle) * distance;
        
        return new Vec2(x, y);
    }
    
    private createWarning(position: Vec2): void {
        const warningEntity = this.scene.createEntity("AirStrikeWarning");
        
        const transform = new Transform(position.x, position.y, 0);
        warningEntity.addComponent(transform);
        
        const warning = new ExplosionWarning(100, this.warningTime);
        warningEntity.addComponent(warning);
        
        const renderable = RenderSystem.createExplosionWarning();
        warningEntity.addComponent(renderable);
        
        this.warningEntities.push(warningEntity);
    }
    
    private launchMissiles(): void {
        for (const warningEntity of this.warningEntities) {
            warningEntity.destroy();
        }
        this.warningEntities = [];
        
        for (const target of this.strikeTargets) {
            this.createMissile(target);
        }
    }
    
    private updateMissiles(deltaTime: number): void {
        for (let i = this.missileEntities.length - 1; i >= 0; i--) {
            const missile = this.missileEntities[i];
            const transform = missile.getComponent(Transform);
            
            if (!transform) {
                this.missileEntities.splice(i, 1);
                continue;
            }
            
            transform.position.y -= 300 * deltaTime;
            transform.rotation += 8 * deltaTime;
            
            const targetY = this.missileTargets.get(missile.id) || 0;
            if (transform.position.y <= targetY) {
                this.explodeMissile(missile, i);
            }
        }
        
        if (this.missileEntities.length === 0 && this.missilesLaunched) {
            this.isActive = false;
            this.strikeTargets = [];
            this.missilesLaunched = false;
        }
    }
    
    private createMissile(target: Vec2): void {
        const missile = this.scene.createEntity("Missile");
        
        const transform = new Transform(target.x, target.y + 400, 0);
        missile.addComponent(transform);
        
        const renderable = RenderSystem.createGrenade();
        missile.addComponent(renderable);
        
        this.missileTargets.set(missile.id, target.y);
        this.missileEntities.push(missile);
    }
    
    private explodeMissile(missile: Entity, index: number): void {
        const transform = missile.getComponent(Transform);
        if (transform) {
            this.createExplosion(new Vec2(transform.position.x, transform.position.y));
        }
        
        this.missileTargets.delete(missile.id);
        missile.destroy();
        this.missileEntities.splice(index, 1);
        
        this.scene.eventSystem.emit('camera:shake', { type: 'strong' });
    }
    
    private createExplosion(position: Vec2): void {
        const explosionRadius = 80;
        const explosionDamage = 100;
        
        const enemyEntities = this.scene.findEntitiesByTag(EntityTags.ENEMY);
        
        for (const enemy of enemyEntities) {
            const enemyTransform = enemy.getComponent(Transform);
            const enemyHealth = enemy.getComponent(Health);
            
            if (enemyTransform && enemyHealth) {
                const enemyPos = new Vec2(enemyTransform.position.x, enemyTransform.position.y);
                const distance = Vec2.distance(position, enemyPos);
                
                if (distance <= explosionRadius) {
                    const damageRatio = 1 - (distance / explosionRadius);
                    const damage = Math.floor(explosionDamage * damageRatio);
                    
                    enemyHealth.takeDamage(damage);
                    
                    if (enemyHealth.current <= 0) {
                        this.createDeathParticles(enemyTransform.position.x, enemyTransform.position.y);
                        enemy.destroy();
                    }
                }
            }
        }
        
        this.createExplosionParticles(position.x, position.y);
    }
    
    private createDeathParticles(x: number, y: number): void {
        const particleEntity = this.scene.createEntity("DeathParticles");
        const transform = new Transform(x, y, 0);
        const particles = ParticleEffect.createDeathExplosion();
        
        particleEntity.addComponent(transform);
        particleEntity.addComponent(particles);
        
        particles.emitterPosition.set(x, y);
        particles.burst(8);
    }
    
    private createExplosionParticles(x: number, y: number): void {
        const particleEntity = this.scene.createEntity("ExplosionParticles");
        const transform = new Transform(x, y, 0);
        const particles = ParticleEffect.createDeathExplosion();
        
        particleEntity.addComponent(transform);
        particleEntity.addComponent(particles);
        
        particles.emitterPosition.set(x, y);
        particles.burst(15);
    }
} 