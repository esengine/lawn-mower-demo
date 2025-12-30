import { Scene, Core, Time, Entity } from '@esengine/ecs-framework';
import { Transform, Renderable, Movement, Health, ParticleEffect, Weapon, ColliderComponent, PlayerInput, CameraTarget, EnemySpawner, Collectible, CollectibleType, NetworkPlayer } from '../components';
import { RenderSystem, MovementSystem, WeaponSystem, ProjectileSystem, AirStrikeSystem, PowerUpSpawner, CollisionSystem, CollectibleSystem, PlayerInputSystem, AISystem, CameraFollowSystem, HealthSystem, VectorizedParticleSystem, EnemySpawnSystem, PhysicsSystem, CameraShakeSystem } from '../systems';
import { director, Node, Color, Vec2, PhysicsSystem2D, Camera, Layers } from 'cc';
import { ITimer } from '@esengine/ecs-framework';
import { EntityTags } from '../EntityTags';

/**
 * 游戏场景
 */
export class GameScene extends Scene {

    private playerEntity: Entity = null;
    private gameContainer: Node = null;
    private mainCamera: Camera | null = null;
    private renderSystem: RenderSystem | null = null;
    private vectorizedParticleSystem: VectorizedParticleSystem | null = null;
    private enemySpawnSystem: EnemySpawnSystem | null = null;
    private cameraShakeSystem: CameraShakeSystem | null = null;
    private playerInputSystem: PlayerInputSystem | null = null;

    // 网络玩家管理
    private networkPlayers: Map<string, Entity> = new Map();
    private ecsManager: any = null;

    // 是否是网络模式（网络模式下敌人由服务器生成）
    private isNetworkMode: boolean = false;
    
    /**
     * 场景初始化 - ECS框架标准
     */
    public initialize(): void {
        super.initialize();
        
        this.name = "LawnMowerShooterScene";
        this.enablePhysics();
        this.createGameContainer();
        
        this.playerInputSystem = new PlayerInputSystem();
        this.addEntityProcessor(this.playerInputSystem);
        this.addEntityProcessor(new MovementSystem());
        this.addEntityProcessor(new AISystem());
        this.addEntityProcessor(new WeaponSystem());
        this.addEntityProcessor(new ProjectileSystem());
        this.addEntityProcessor(new AirStrikeSystem());
        // PowerUpSpawner 只在非网络模式下使用，网络模式下由服务器生成
        if (!this.isNetworkMode) {
            this.addEntityProcessor(new PowerUpSpawner());
        }
        this.addEntityProcessor(new CollisionSystem());
        this.addEntityProcessor(new CollectibleSystem());
        this.addEntityProcessor(new HealthSystem());

        this.vectorizedParticleSystem = new VectorizedParticleSystem();
        this.addEntityProcessor(this.vectorizedParticleSystem);
        
        this.addEntityProcessor(new CameraFollowSystem());
        this.addEntityProcessor(new PhysicsSystem());
        
        this.renderSystem = new RenderSystem();
        this.addEntityProcessor(this.renderSystem);

        // 只有非网络模式下才创建本地敌人生成系统
        if (!this.isNetworkMode) {
            this.enemySpawnSystem = new EnemySpawnSystem();
            this.addEntityProcessor(this.enemySpawnSystem);
        }

        this.cameraShakeSystem = new CameraShakeSystem();
        this.addEntityProcessor(this.cameraShakeSystem);

        this.setupSystemDependencies();

        // 只有非网络模式下才创建本地玩家和敌人生成器
        if (!this.isNetworkMode) {
            this.createPlayer();
            this.createEnemySpawner();
        }
    }

    /**
     * 设置网络模式
     * 在网络模式下，敌人由服务器生成
     */
    public setNetworkMode(enabled: boolean): void {
        this.isNetworkMode = enabled;
    }
    
    /**
     * 启用物理系统
     */
    private enablePhysics(): void {
        const physicsSystem = PhysicsSystem2D.instance;
        physicsSystem.enable = false;
    }
    
    /**
     * 创建游戏容器
     */
    private createGameContainer(): void {
        const scene = director.getScene();
        const canvas = scene?.getChildByName('Canvas');
        
        if (canvas) {
            this.gameContainer = new Node('GameContainer');
            this.gameContainer.parent = canvas;
            this.gameContainer.layer = Layers.Enum.UI_2D;
            
            this.mainCamera = canvas.getChildByName("Camera").getComponent(Camera);
        }
    }
    
    /**
     * 设置系统依赖关系
     */
    private setupSystemDependencies(): void {
        if (this.gameContainer) {
            this.renderSystem?.setGameContainer(this.gameContainer);
            
            const weaponSystem = this.getEntityProcessor(WeaponSystem);
            if (weaponSystem) {
                weaponSystem.setGameContainer(this.gameContainer);
            }
            
            if (this.vectorizedParticleSystem) {
                this.vectorizedParticleSystem.setGameContainer(this.gameContainer);
            }
        }
        
        if (this.mainCamera) {
            const cameraFollowSystem = this.getEntityProcessor(CameraFollowSystem);
            if (cameraFollowSystem) {
                cameraFollowSystem.setCamera(this.mainCamera);
            }
        }
    }

    public onStart(): void {
        super.onStart();
    }
    
    private createPlayer(): void {
        this.playerEntity = this.createEntity("ShooterHero");
        this.playerEntity.tag = EntityTags.PLAYER;
        
        const transform = new Transform(0, 0, 0);
        this.playerEntity.addComponent(transform);
        
        const movement = new Movement(180);
        this.playerEntity.addComponent(movement);
        
        const playerInput = new PlayerInput();
        this.playerEntity.addComponent(playerInput);
        
        const cameraTarget = new CameraTarget(100);
        this.playerEntity.addComponent(cameraTarget);
        
        const renderable = RenderSystem.createPlayer();
        this.playerEntity.addComponent(renderable);
        
        const health = new Health(999999);
        this.playerEntity.addComponent(health);
        
        const weapon = new Weapon(30, 16);
        weapon.bulletSpeed = 600;
        weapon.bulletLifeTime = 2;
        weapon.bulletSize = 4;
        weapon.pierceCount = 1;
        weapon.autoFire = true;
        this.playerEntity.addComponent(weapon);
        
        const collider = new ColliderComponent('circle');
        collider.setSize(15);
        this.playerEntity.addComponent(collider);
    }
    
    /**
     * 创建网络玩家（本地玩家）
     */
    public createNetworkPlayer(clientId: string, playerName: string, isLocalPlayer: boolean = true): Entity {
        const entity = this.createEntity(`NetworkPlayer_${clientId}`);
        entity.tag = EntityTags.PLAYER;
        
        // 基础组件
        const transform = new Transform(0, 0, 0);
        entity.addComponent(transform);
        
        const movement = new Movement(180);
        entity.addComponent(movement);
        
        // 网络玩家组件
        const networkPlayer = new NetworkPlayer();
        networkPlayer.init(clientId, isLocalPlayer, playerName);
        entity.addComponent(networkPlayer);
        
        // 只有本地玩家才能接受输入
        if (isLocalPlayer) {
            const playerInput = new PlayerInput();
            entity.addComponent(playerInput);
            
            const cameraTarget = new CameraTarget(100);
            entity.addComponent(cameraTarget);
            
            // 设置为主玩家实体
            this.playerEntity = entity;
        }
        
        const renderable = RenderSystem.createPlayer();
        entity.addComponent(renderable);
        
        const health = new Health(999999);
        entity.addComponent(health);
        
        const weapon = new Weapon(30, 16);
        weapon.bulletSpeed = 600;
        weapon.bulletLifeTime = 2;
        weapon.bulletSize = 4;
        weapon.pierceCount = 1;
        weapon.autoFire = isLocalPlayer; // 只有本地玩家自动开火
        entity.addComponent(weapon);
        
        const collider = new ColliderComponent('circle');
        collider.setSize(15);
        entity.addComponent(collider);
        
        // 存储网络玩家
        this.networkPlayers.set(clientId, entity);
        
        return entity;
    }
    
    /**
     * 移除网络玩家
     */
    public removeNetworkPlayer(clientId: string): void {
        const entity = this.networkPlayers.get(clientId);
        if (entity) {
            entity.destroy();
            this.networkPlayers.delete(clientId);
        }
    }
    
    /**
     * 获取网络玩家
     */
    public getNetworkPlayer(clientId: string): Entity | null {
        return this.networkPlayers.get(clientId) || null;
    }
    
    /**
     * 设置ECS管理器到输入系统
     */
    public setECSManager(ecsManager: any): void {
        this.ecsManager = ecsManager;
        if (this.playerInputSystem) {
            this.playerInputSystem.setECSManager(ecsManager);
        }
    }
    
    /**
     * 获取ECS管理器
     */
    public getECSManager(): any {
        return this.ecsManager;
    }
    
    /**
     * 创建本地玩家
     */
    public createLocalPlayer(clientId: string, playerName: string): void {
        // 删除之前创建的普通玩家（如果有的话）
        if (this.playerEntity) {
            this.playerEntity.destroy();
        }
        
        // 创建本地网络玩家
        this.playerEntity = this.createNetworkPlayer(clientId, playerName, true);
    }
    
    private createEnemySpawner(): void {
        const spawnerEntity = this.createEntity("EnemySpawner");
        spawnerEntity.tag = EntityTags.SPAWNER;
        
        const spawner = new EnemySpawner(50.0);
        spawnerEntity.addComponent(spawner);
    }
    

    
    private handlePlayerHit(): void {
        const health = this.playerEntity?.getComponent(Health);
        if (health) {
            health.takeDamage(10);
            
            if (health.current <= 0) {
                
            }
        }
    }
    
    /**
     * 获取摄像机震动系统
     */
    public getCameraShakeSystem(): CameraShakeSystem | null {
        return this.cameraShakeSystem;
    }
    
    /**
     * 场景卸载
     */
    public unload(): void {
        if (this.gameContainer) {
            this.gameContainer.destroy();
            this.gameContainer = null;
        }
        
        this.playerEntity = null;
        this.mainCamera = null;
        this.renderSystem = null;
        this.vectorizedParticleSystem = null;
        this.enemySpawnSystem = null;
        this.cameraShakeSystem = null;
        this.playerInputSystem = null;
        
        // 清理网络玩家
        this.networkPlayers.clear();
        
        super.unload();
    }
    
    public getPlayer(): Entity | null {
        return this.playerEntity;
    }
    
    public getRenderSystem(): RenderSystem | null {
        return this.renderSystem;
    }
} 