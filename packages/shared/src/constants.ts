/**
 * @zh 游戏常量
 * @en Game Constants
 */

/**
 * @zh 玩家移动速度（单位/秒）
 * @en Player move speed (units/second)
 */
export const PLAYER_MOVE_SPEED = 180;

/**
 * @zh 玩家初始生命值
 * @en Player initial health
 */
export const PLAYER_INITIAL_HEALTH = 100;

/**
 * @zh 子弹速度
 * @en Bullet speed
 */
export const BULLET_SPEED = 400;

/**
 * @zh 子弹伤害
 * @en Bullet damage
 */
export const BULLET_DAMAGE = 25;

/**
 * @zh 地图边界
 * @en Map bounds
 */
export const MAP_BOUNDS = {
    minX: -500,
    maxX: 500,
    minY: -500,
    maxY: 500,
};

// =========================================================================
// Enemy Constants | 敌人常量
// =========================================================================

/**
 * @zh 敌人移动速度
 * @en Enemy move speed
 */
export const ENEMY_MOVE_SPEED = 60;

/**
 * @zh 敌人初始生命值
 * @en Enemy initial health
 */
export const ENEMY_INITIAL_HEALTH = 25;

/**
 * @zh 敌人生成间隔（秒）
 * @en Enemy spawn interval (seconds)
 */
export const ENEMY_SPAWN_INTERVAL = 2.0;

/**
 * @zh 最大敌人数量
 * @en Maximum enemy count
 */
export const MAX_ENEMIES = 50;

/**
 * @zh 敌人生成距离（离玩家的距离）
 * @en Enemy spawn distance from player
 */
export const ENEMY_SPAWN_DISTANCE = 400;

// =========================================================================
// Collectible Constants | 收集物常量
// =========================================================================

/**
 * @zh 收集物生成间隔（秒）
 * @en Collectible spawn interval (seconds)
 */
export const COLLECTIBLE_SPAWN_INTERVAL = 10.0;

/**
 * @zh 最大收集物数量
 * @en Maximum collectible count
 */
export const MAX_COLLECTIBLES = 5;

/**
 * @zh 收集物生成距离（离玩家的距离）
 * @en Collectible spawn distance from player
 */
export const COLLECTIBLE_SPAWN_DISTANCE = 150;

/**
 * @zh 收集物收集半径
 * @en Collectible collect radius
 */
export const COLLECTIBLE_COLLECT_RADIUS = 30;

// =========================================================================
// AirStrike Constants | 空袭常量
// =========================================================================

/**
 * @zh 空袭目标数量
 * @en Number of air strike targets
 */
export const AIRSTRIKE_COUNT = 10;

/**
 * @zh 空袭半径
 * @en Air strike radius
 */
export const AIRSTRIKE_RADIUS = 300;

/**
 * @zh 空袭警告时间（秒）
 * @en Air strike warning time (seconds)
 */
export const AIRSTRIKE_WARNING_TIME = 2.0;

/**
 * @zh 空袭爆炸半径
 * @en Air strike explosion radius
 */
export const AIRSTRIKE_EXPLOSION_RADIUS = 80;

/**
 * @zh 空袭爆炸伤害
 * @en Air strike explosion damage
 */
export const AIRSTRIKE_EXPLOSION_DAMAGE = 100;
