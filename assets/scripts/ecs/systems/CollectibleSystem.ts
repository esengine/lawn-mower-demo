import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { Transform, ColliderComponent, Collectible, CollectibleType, Weapon } from '../components';
import { PhysicsWorld, CollisionPair } from '../PhysicsWorld';
import { EntityTags } from '../EntityTags';
import { Vec2 } from 'cc';

@ECSSystem('CollectibleSystem')
export class CollectibleSystem extends EntitySystem {
    private physicsWorld: PhysicsWorld;

    constructor() {
        super(Matcher.all(Transform, ColliderComponent, Collectible));
        this.physicsWorld = new PhysicsWorld();
    }

    protected process(entities: Entity[]): void {
        const playerEntities = this.scene.findEntitiesByTag(EntityTags.PLAYER);
        if (playerEntities.length === 0) return;

        const player = playerEntities[0];
        const playerTransform = player.getComponent(Transform);
        const playerCollider = player.getComponent(ColliderComponent);

        if (!playerTransform || !playerCollider) return;

        for (const collectible of entities) {
            const collectibleComponent = collectible.getComponent(Collectible);
            if (!collectibleComponent || collectibleComponent.isCollected) continue;

            const collectibleTransform = collectible.getComponent(Transform);
            const collectibleCollider = collectible.getComponent(ColliderComponent);

            if (!collectibleTransform || !collectibleCollider) continue;

            if (this.checkCollision(playerTransform, playerCollider, collectibleTransform, collectibleCollider)) {
                this.handleCollection(player, collectible, collectibleComponent);
            }
        }
    }

    private checkCollision(playerTransform: Transform, playerCollider: ColliderComponent,
                          collectibleTransform: Transform, collectibleCollider: ColliderComponent): boolean {
        const playerPos = new Vec2(playerTransform.position.x, playerTransform.position.y);
        const collectiblePos = new Vec2(collectibleTransform.position.x, collectibleTransform.position.y);

        const distance = Vec2.distance(playerPos, collectiblePos);
        const collisionDistance = (playerCollider.radius + collectibleCollider.radius);

        return distance <= collisionDistance;
    }

    private handleCollection(player: Entity, collectible: Entity, collectibleComponent: Collectible): void {
        collectibleComponent.collect();

        // Collectible effects are handled by server authority
        // Server broadcasts AirStrike event after detecting collection, client just waits
        // Do not trigger airstrike here to avoid desync with server broadcast

        // Do not destroy entity, wait for server despawn sync
    }
}